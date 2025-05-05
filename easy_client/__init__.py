"""
MikroTik Easy Client - A user-friendly Python client for ISP management with MikroTik routers

This package provides an intuitive interface for common ISP operations without requiring
deep knowledge of MikroTik RouterOS commands and structure.
"""

import requests
import json
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass
from enum import Enum

from easy_client.context import ServerContext
from mtk_command_api.utility import EthernetInterface, DhcpClient


@dataclass
class Response:
    """Standard response object for all API calls"""
    success: bool
    data: Any = None
    error_code: str = None
    error_message: str = None

    @classmethod
    def from_dict(cls, data: Dict) -> 'Response':
        """Create Response object from dictionary"""
        return cls(
            success=data.get("status") == "success",
            data=data.get("data"),
            error_code=data.get("error"),
            error_message=data.get("message")
        )


class SpeedLimit(Enum):
    """Common internet speed limits"""
    UNLIMITED = "0/0"
    BASIC_1M = "1M/1M"
    STANDARD_5M = "5M/5M"
    PREMIUM_10M = "10M/5M"
    BUSINESS_20M = "20M/10M"

    @classmethod
    def custom(cls, download: str, upload: str) -> str:
        """Create custom speed limit in format download/upload"""
        return f"{download}/{upload}"


class MikrotikClient:
    """
    Main client for interacting with MikroTik routers through a Flask API server

    This class provides a user-friendly interface for common ISP operations
    without requiring deep knowledge of MikroTik RouterOS.
    """

    def __init__(self, api_url: str, username: str, password: str, api_key: Optional[str] = None, **kwargs):
        """
        Initialize the MikroTik client

        Args:
            api_url: URL of the Flask API server
            username: MikroTik router username
            password: MikroTik router password
            api_key: Optional API key for the Flask server
        """
        self.extra_params = kwargs
        self.api_url = api_url.rstrip('/')
        self.username = username
        self.password = password
        self.api_key = api_key

        # Create sub-clients for different sections
        self.internet_packages = InternetPackages(self)
        self.customers = Customers(self)
        self.network = Network(self)
        self.hotspot = Hotspot(self)
        self.system = System(self)
        self._context: SeverContext | None = None

    def _send_request(self, command: str, parameters: Dict = None) -> 'Response':
        """
        Send request to the API server

        Args:
            command: RouterOS command path
            parameters: Command parameters

        Returns:
            Response object with result or error information
        """
        if parameters is None:
            parameters = {}

        # If we're in a batch context, add the operation to the batch
        if self._context and self._context.in_context:
            self._context.add_operation(command, parameters)
            # Return a placeholder response since actual execution will happen later
            return Response(success=True, data={"batched": True})

        payload = {
            "credentials": {
                "username": self.username,
                "password": self.password
            },
            "command": command,
            "parameters": parameters,
            **self.extra_params
        }

        if self.api_key:
            payload["api_key"] = self.api_key

        try:
            response = requests.post(f"{self.api_url}/api/routeros", json=payload)
            print(response.text)
            return Response.from_dict(response.json())
        except Exception as e:
            return Response(
                success=False,
                error_code="request_failed",
                error_message=str(e)
            )

    def send_bulk_request(self, operations: list) -> Response:
        """
        Send multiple operations in a single request

        Args:
            operations: List of operations (command + parameters)

        Returns:
            Response object with combined results
        """
        payload = {
            "credentials": {
                "username": self.username,
                "password": self.password
            },
            "bulk": True,
            "operations": operations,
            **self.extra_params
        }

        if self.api_key:
            payload["api_key"] = self.api_key

        try:
            response = requests.post(f"{self.api_url}/api/routeros/bulk", json=payload)
            return Response.from_dict(response.json())
        except Exception as e:
            return Response(
                success=False,
                error_code="request_failed",
                error_message=str(e)
            )

    def context(self, context_type):
        """
        Create a new context for batched operations

        Args:
            context_type: Type of context ("bulk" for now)

        Returns:
            Context manager for the batch operations
        """
        self._context = ServerContext(context_type)
        return self._context


class InternetPackages:
    """
    Manage internet packages (PPP profiles in MikroTik terminology)

    Internet packages define the service levels available to customers,
    including speed limits, address pools, and other connection parameters.
    """

    def __init__(self, client: MikrotikClient):
        self.client = client

    def list_all(self) -> Response:
        """
        List all available internet packages

        Returns:
            Response with list of all internet packages
        """
        return self.client._send_request("/ppp/profile/print")

    def get(self, name: str) -> Response:
        """
        Get details of a specific internet package

        Args:
            name: Name of the internet package

        Returns:
            Response with package details
        """
        return self.client._send_request("/ppp/profile/print", {"name": name})

    def create(self,
               name: str,
               speed_limit: Union[str, SpeedLimit] = SpeedLimit.UNLIMITED,
               local_address: str = None,
               remote_address: str = None,
               dns_servers: List[str] = None,
               session_timeout: str = None) -> Response:
        """
        Create a new internet package

        Args:
            name: Name of the package (e.g. "Basic", "Premium")
            speed_limit: Download/upload speed limit (e.g. "10M/5M")
            local_address: Router-side IP address
            remote_address: IP address or pool for customers
            dns_servers: List of DNS servers
            session_timeout: Session timeout (e.g. "1d" for one day)

        Returns:
            Response indicating success or failure
        """
        parameters = {
            "name": name
        }

        # Handle SpeedLimit enum
        if isinstance(speed_limit, SpeedLimit):
            speed_limit = speed_limit.value

        if speed_limit:
            parameters["rate-limit"] = speed_limit

        if local_address:
            parameters["local-address"] = local_address

        if remote_address:
            parameters["remote-address"] = remote_address

        if dns_servers:
            parameters["dns-server"] = ",".join(dns_servers)

        if session_timeout:
            parameters["session-timeout"] = session_timeout

        return self.client._send_request("/ppp/profile/add", parameters)

    def update(self, name: str, **attributes) -> Response:
        """
        Update an existing internet package

        Args:
            name: Name of the package to update
            **attributes: Attributes to update

        Returns:
            Response indicating success or failure
        """
        # First find the profile to get its ID
        profile_response = self.get(name)
        if not profile_response.success or not profile_response.data:
            return Response(
                success=False,
                error_code="profile_not_found",
                error_message=f"Internet package '{name}' not found"
            )

        # Get the ID of the first matching profile
        profile_id = profile_response.data[0].get(".id")

        # Prepare parameters
        parameters = {".id": profile_id}
        parameters.update(attributes)

        return self.client._send_request("/ppp/profile/set", parameters)

    def delete(self, name: str) -> Response:
        """
        Delete an internet package

        Args:
            name: Name of the package to delete

        Returns:
            Response indicating success or failure
        """
        # First find the profile to get its ID
        profile_response = self.get(name)
        if not profile_response.success or not profile_response.data:
            return Response(
                success=False,
                error_code="profile_not_found",
                error_message=f"Internet package '{name}' not found"
            )

        # Get the ID of the first matching profile
        profile_id = profile_response.data[0].get(".id")

        return self.client._send_request("/ppp/profile/remove", {".id": profile_id})


class Customers:
    """
    Manage customer connections (PPP secrets in MikroTik terminology)

    This class provides methods for adding, updating, and removing customer accounts,
    as well as viewing their connection status and usage statistics.
    """

    def __init__(self, client: MikrotikClient):
        self.client = client

    def list_all(self) -> Response:
        """
        List all customers

        Returns:
            Response with list of all customers
        """
        return self.client._send_request("/ppp/secret/print")

    def get(self, username: str) -> Response:
        """
        Get details of a specific customer

        Args:
            username: Customer username

        Returns:
            Response with customer details
        """
        return self.client._send_request("/ppp/secret/print", {"name": username})

    def create(self,
               username: str,
               password: str,
               package: str,
               service: str = "pppoe",
               comment: str = None) -> Response:
        """
        Create a new customer account

        Args:
            username: Customer username for login
            password: Customer password
            package: Internet package name to assign
            service: Connection service type (pppoe, pptp, l2tp, ovpn)
            comment: Optional comment or customer info

        Returns:
            Response indicating success or failure
        """
        parameters = {
            "name": username,
            "password": password,
            "profile": package,
            "service": service
        }

        if comment:
            parameters["comment"] = comment

        return self.client._send_request("/ppp/secret/add", parameters)

    def update(self, username: str, **attributes) -> Response:
        """
        Update an existing customer account

        Args:
            username: Customer username
            **attributes: Attributes to update

        Returns:
            Response indicating success or failure
        """
        # First find the secret to get its ID
        secret_response = self.get(username)
        if not secret_response.success or not secret_response.data:
            return Response(
                success=False,
                error_code="customer_not_found",
                error_message=f"Customer '{username}' not found"
            )

        # Get the ID of the first matching secret
        secret_id = secret_response.data[0].get(".id")

        # Prepare parameters
        parameters = {".id": secret_id}
        parameters.update(attributes)

        return self.client._send_request("/ppp/secret/set", parameters)

    def delete(self, username: str) -> Response:
        """
        Delete a customer account

        Args:
            username: Customer username

        Returns:
            Response indicating success or failure
        """
        # First find the secret to get its ID
        secret_response = self.get(username)
        if not secret_response.success or not secret_response.data:
            return Response(
                success=False,
                error_code="customer_not_found",
                error_message=f"Customer '{username}' not found"
            )

        # Get the ID of the first matching secret
        secret_id = secret_response.data[0].get(".id")

        return self.client._send_request("/ppp/secret/remove", {".id": secret_id})

    def get_active_connections(self) -> Response:
        """
        Get all currently active customer connections

        Returns:
            Response with list of active connections
        """
        return self.client._send_request("/ppp/active/print")

    def disconnect(self, username: str) -> Response:
        """
        Disconnect a currently connected customer

        Args:
            username: Customer username

        Returns:
            Response indicating success or failure
        """
        # First find the active connection to get its ID
        active_response = self.client._send_request("/ppp/active/print", {"name": username})
        if not active_response.success or not active_response.data:
            return Response(
                success=False,
                error_code="not_connected",
                error_message=f"Customer '{username}' is not currently connected"
            )

        # Get the ID of the first matching active connection
        active_id = active_response.data[0].get(".id")

        return self.client._send_request("/ppp/active/remove", {".id": active_id})


class Network:
    """
    Manage network settings (IP addresses, DHCP, DNS, etc.)

    This class provides methods for configuring basic network settings
    required for ISP operations.
    """

    def __init__(self, client: MikrotikClient):
        self.client = client

    def list_interfaces(self) -> Response:
        """
        List all network interfaces

        Returns:
            Response with list of all interfaces
        """
        return self.client._send_request("/interface/print")

    def list_ports(self) -> List[EthernetInterface]:
        """
        List all network ports

        Returns:
            Response with list of all ports e.g ether1,ether2 sfp
        """
        res = self.client._send_request("/interface/ethernet/print")
        if res.success and res.data:
            return [EthernetInterface.from_dict(d) for d in res.data]
        return []

    @property
    def wan(self) -> List[DhcpClient]:
        """
        List all network ports

        Returns:
            Response with list of all ports e.g ether1,ether2 sfp
        """
        res = self.client._send_request("/ip/dhcp-client/print")
        if res.success and res.data:
            return [DhcpClient.from_dict(d) for d in res.data]
        return []

    def ip_addresses(self, interface=None) -> Response | str:
        """
        List all IP address assignments

        Returns:
            Response with list of IP address assignments
        """
        res = self.client._send_request("/ip/address/print")
        if not interface:
            return res
        if res.success and res.data:
            matching = list(filter(lambda e: interface in e['interface'], res.data))
            if matching:
                ip = matching[0]['address'].split('/')[0]
                return ip
        return ''

    def add_ip_address(self, address: str, interface: str) -> Response:
        """
        Add a new IP address assignment

        Args:
            address: IP address with netmask (e.g. "192.168.1.1/24")
            interface: Interface name

        Returns:
            Response indicating success or failure
        """
        parameters = {
            "address": address,
            "interface": interface
        }

        return self.client._send_request("/ip/address/add", parameters)

    def create_address_pool(self, name: str, ranges: List[str]) -> Response:
        """
        Create a new IP address pool for customer assignment

        Args:
            name: Pool name
            ranges: List of IP ranges (e.g. ["192.168.1.10-192.168.1.100"])

        Returns:
            Response indicating success or failure
        """
        parameters = {
            "name": name,
            "ranges": ",".join(ranges)
        }

        return self.client._send_request("/ip/pool/add", parameters)

    def list_bridges(self) -> Response:
        """
        List all bridge interfaces

        Returns:
            Response with list of all bridges
        """
        return self.client._send_request("/interface/bridge/print")

    def create_bridge(self, name: str, protocol_mode: str = "rstp", comment: str = None) -> Response:
        """
        Create a new bridge interface

        Args:
            name: Bridge name (e.g. "bridge-lan")
            protocol_mode: Bridge protocol (none, stp, rstp)
            comment: Optional comment

        Returns:
            Response indicating success or failure
        """
        parameters = {
            "name": name,
            "protocol-mode": protocol_mode
        }

        if comment:
            parameters["comment"] = comment

        return self.client._send_request("/interface/bridge/add", parameters)

    def add_bridge_port(self, interface: str, bridge: str) -> Response:
        """
        Add an interface to a bridge

        Args:
            interface: Interface name to add to the bridge
            bridge: Bridge name

        Returns:
            Response indicating success or failure
        """
        parameters = {
            "interface": interface,
            "bridge": bridge
        }

        return self.client._send_request("/interface/bridge/port/add", parameters)

    def remove_bridge_port(self, interface: str) -> Response:
        """
        Remove an interface from any bridge

        Args:
            interface: Interface name to remove from bridge

        Returns:
            Response indicating success or failure
        """
        # First get the port ID
        port_response = self.client._send_request("/interface/bridge/port/print", {"interface": interface})

        if not port_response.success or not port_response.data:
            return Response(
                success=False,
                error_code="port_not_found",
                error_message=f"Bridge port for interface '{interface}' not found"
            )

        port_id = port_response.data[0].get(".id")
        return self.client._send_request("/interface/bridge/port/remove", {".id": port_id})


class Hotspot:
    """
    Manage hotspot services for public or customer access

    This class provides methods for configuring and managing hotspot services,
    user profiles, and access policies.
    """

    def __init__(self, client: MikrotikClient):
        self.client = client

    def list_servers(self) -> Response:
        """
        List all hotspot servers

        Returns:
            Response with list of hotspot servers
        """
        return self.client._send_request("/ip/hotspot/print")

    def setup(self, interface: str, address: str, pool: str) -> Response:
        """
        Set up a new hotspot server

        Args:
            interface: Interface to run hotspot on
            address: Address of hotspot server
            pool: Address pool for clients

        Returns:
            Response indicating success or failure
        """
        parameters = {
            "interface": interface,
            "address-pool": pool,
            "addresses-per-mac": "1"
        }

        return self.client._send_request("/ip/hotspot/add", parameters)

    def list_users(self) -> Response:
        """
        List all hotspot users

        Returns:
            Response with list of hotspot users
        """
        return self.client._send_request("/ip/hotspot/user/print")

    def create_user(self, name: str, password: str, profile: str = "default") -> Response:
        """
        Create a new hotspot user

        Args:
            name: Username
            password: Password
            profile: User profile

        Returns:
            Response indicating success or failure
        """
        parameters = {
            "name": name,
            "password": password,
            "profile": profile
        }

        return self.client._send_request("/ip/hotspot/user/add", parameters)

    def list_profiles(self) -> Response:
        """
        List all hotspot user profiles

        Returns:
            Response with list of hotspot user profiles
        """
        return self.client._send_request("/ip/hotspot/user/profile/print")

    def create_profile(self,
                       name: str,
                       speed_limit: Union[str, SpeedLimit] = SpeedLimit.UNLIMITED,
                       session_timeout: str = None,
                       idle_timeout: str = None) -> Response:
        """
        Create a new hotspot user profile

        Args:
            name: Profile name
            speed_limit: Download/upload speed limit
            session_timeout: Session timeout (e.g. "1d" for one day)
            idle_timeout: Idle timeout

        Returns:
            Response indicating success or failure
        """
        parameters = {
            "name": name
        }

        # Handle SpeedLimit enum
        if isinstance(speed_limit, SpeedLimit):
            speed_limit = speed_limit.value

        if speed_limit:
            parameters["rate-limit"] = speed_limit

        if session_timeout:
            parameters["session-timeout"] = session_timeout

        if idle_timeout:
            parameters["idle-timeout"] = idle_timeout

        return self.client._send_request("/ip/hotspot/user/profile/add", parameters)


class System:
    """
    Manage system settings and operations

    This class provides methods for restarting the router, updating firmware,
    and viewing system information.
    """

    def __init__(self, client: MikrotikClient):
        self.client = client

    def get_resources(self) -> Response:
        """
        Get system resource information

        Returns:
            Response with system resources info
        """
        return self.client._send_request("/system/resource/print")

    def reboot(self) -> Response:
        """
        Reboot the router

        Returns:
            Response indicating success or failure
        """
        return self.client._send_request("/system/reboot")

    def get_identity(self) -> Response:
        """
        Get router identity (hostname)

        Returns:
            Response with router identity
        """
        return self.client._send_request("/system/identity/print")

    def set_identity(self, name: str) -> Response:
        """
        Set router identity (hostname)

        Args:
            name: New hostname

        Returns:
            Response indicating success or failure
        """
        return self.client._send_request("/system/identity/set", {"name": name})

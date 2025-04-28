from easy_client import SpeedLimit, MikrotikClient


class SiteSetup:
    """
    High-level class for complete site configurations

    This class orchestrates the various components (network, hotspot, PPPoE)
    to create complete site setups with a single command.
    """

    def __init__(self, client: MikrotikClient):
        self.client = client

    def setup_bridge(self, site_id: str, lan_interfaces: list = None) -> str:
        """
        Create a bridge interface for the site

        Args:
            site_id: Site identifier
            lan_interfaces: List of LAN interfaces to add to the bridge

        Returns:
            Name of the created bridge
        """
        if lan_interfaces is None:
            lan_interfaces = ["ether2", "ether3", "ether4"]

        bridge_name = f"bridge-{site_id}"

        # Create bridge
        self.client.network.create_bridge(
            name=bridge_name,
            protocol_mode="rstp",
            comment=f"Managed bridge for site {site_id}"
        )

        # Add interfaces to bridge
        for interface in lan_interfaces:
            self.client.network.add_bridge_port(
                interface=interface,
                bridge=bridge_name
            )

        # Set IP on bridge
        self.client.network.add_ip_address(
            address="192.168.88.1/24",
            interface=bridge_name
        )

        return bridge_name

    def setup_bridge(self, site_id: str, lan_interfaces: list = None) -> str:

        # Create default interfaces list if none provided
        if lan_interfaces is None:
            lan_interfaces = ["ether2", "ether3", "ether4", "ether5"]

        bridge_name = f"{site_id}-bridge"

        # Create bridge
        result = self.client.network._send_request("interface/bridge/add", {
            "name": bridge_name,
            "auto-mac": "yes"
        })

        # Add interfaces to bridge
        for interface in lan_interfaces:
            self.client.network._send_request("interface/bridge/port/add", {
                "bridge": bridge_name,
                "interface": interface
            })

        return bridge_name

    def setup_hotspot_site(self, site_id: str, lan_interfaces: list = None,
                           basic_profile: str = "Basic", premium_profile: str = "Premium") -> dict:
        """
        Complete hotspot site setup

        Sets up a complete hotspot configuration including:
        - Site bridge
        - IP pool
        - Hotspot profiles
        - Basic firewall rules
        """
        results = {}

        # 1. Setup bridge
        bridge_name = self.setup_bridge(site_id, lan_interfaces)
        results["bridge"] = bridge_name

        # 2. Create address pool
        pool_name = f"{site_id}-pool"
        pool_result = self.client.network.create_address_pool(
            name=pool_name,
            ranges=["192.168.88.10-192.168.88.254"]
        )
        results["pool"] = pool_result.success

        # 3. Create hotspot profiles
        basic = self.client.hotspot.create_profile(
            name=basic_profile,
            speed_limit=SpeedLimit.BASIC_1M,
            session_timeout="1d"
        )
        results["basic_profile"] = basic.success

        premium = self.client.hotspot.create_profile(
            name=premium_profile,
            speed_limit=SpeedLimit.PREMIUM_10M,
            session_timeout="7d"
        )
        results["premium_profile"] = premium.success

        # 4. Setup hotspot on bridge
        hotspot_result = self.client.hotspot.setup(
            interface=bridge_name,
            address="192.168.88.1/24",
            pool=pool_name
        )
        results["hotspot"] = hotspot_result.success

        return results

    def setup_pppoe_site(self, site_id: str, lan_interfaces: list = None) -> dict:
        """
        Complete PPPoE site setup

        Sets up a complete PPPoE server configuration including:
        - Site bridge
        - Internet packages
        - PPPoE server
        - Basic firewall rules
        """
        results = {}

        # Use the bulk context to batch all operations
        with self.client.context("bulk") as bulk:
            # 1. Setup bridge for LAN interfaces
            bridge_name = self.setup_bridge(site_id, lan_interfaces)
            results["bridge"] = bridge_name

            # 2. Create PPPoE address pool
            pool_name = f"{site_id}-pppoe-pool"
            pool_result = self.client.network.create_address_pool(
                name=pool_name,
                ranges=["192.168.70.2-192.168.73.254"]
            )
            results["pool"] = pool_result.success

            # 3. Create internet packages
            # Uncomment when needed
            # basic = self.client.internet_packages.create(
            #     name=basic_package,
            #     speed_limit=SpeedLimit.BASIC_1M,
            #     dns_servers=["8.8.8.8", "8.8.4.4"]
            # )
            # results["basic_package"] = basic.success
            #
            # premium = self.client.internet_packages.create(
            #     name=premium_package,
            #     speed_limit=SpeedLimit.PREMIUM_10M,
            #     dns_servers=["8.8.8.8", "8.8.4.4"]
            # )
            # results["premium_package"] = premium.success

            # 4. Setup PPPoE server
            pppoe_result = self.setup_pppoe_server(
                interface=bridge_name,
                service_name=f"ISP-{site_id}",
                local_address="192.168.70.1",
                address_pool=pool_name
            )
            results["pppoe_server"] = pppoe_result

            # 5. Execute all operations in bulk
            bulk_results = bulk.run_process()

            # After bulk execution, send the actual bulk request
            if bulk_results["status"] == "success":
                bulk_request_result = self.client.send_bulk_request(bulk.operations)
                results["bulk_execution"] = bulk_request_result.data

            return results

    def setup_pppoe_server(self, interface: str, service_name: str,
                           local_address: str, address_pool: str) -> dict:
        """
        Create PPPoE server configuration

        Args:
            interface: Interface to run PPPoE server on
            service_name: PPPoE service name to advertise
            local_address: Local IP address for PPPoE connections
            address_pool: IP pool to assign to clients

        Returns:
            Result of the operation
        """
        # First, ensure PPPoE service is enabled
        self.client._send_request("ppp/service-enable", {
            "service": "pppoe"
        })

        # Create PPPoE server
        result = self.client._send_request("interface/pppoe-server/server/add", {
            "service-name": service_name,
            "interface": interface,
            "default-profile": "default"
        })

        # Configure default profile
        self.client._send_request("ppp/profile/set", {
            ".id": "default",
            "local-address": local_address,
            "remote-address": address_pool,
            "dns-server": "8.8.8.8,8.8.4.4"
        })

        return result.data if result.success else {"error": result.error_message}

    def clear_existing_configuration(self) -> dict:
        """
        Remove existing configurations to prepare for clean setup
        """
        results = {}

        # 1. Remove hotspot servers
        hotspot_servers = self.client._send_request("/ip/hotspot/print")
        if hotspot_servers.success and hotspot_servers.data:
            for server in hotspot_servers.data:
                e = self.client._send_request("/ip/hotspot/remove", {".id": server.get(".id")})
                print(e)
        results["clear_hotspot"] = True

        # 2. Remove PPPoE servers
        pppoe_servers = self.client._send_request("/interface/pppoe-server/server/print")
        if pppoe_servers.success and pppoe_servers.data:
            for server in pppoe_servers.data:
                self.client._send_request("/interface/pppoe-server/server/remove", {".id": server.get(".id")})
        results["clear_pppoe"] = True

        # 3. Remove bridge ports
        bridge_ports = self.client._send_request("/interface/bridge/port/print")
        if bridge_ports.success and bridge_ports.data:
            for port in bridge_ports.data:
                self.client._send_request("/interface/bridge/port/remove", {".id": port.get(".id")})
        results["clear_bridge_ports"] = True

        # 4. Remove bridges
        bridges = self.client._send_request("/interface/bridge/print")
        if bridges.success and bridges.data:
            for bridge in bridges.data:
                self.client._send_request("/interface/bridge/remove", {".id": bridge.get(".id")})
        results["clear_bridges"] = True

        # 5. Remove IP pools (except default if exists)
        pools = self.client._send_request("/ip/pool/print")
        if pools.success and pools.data:
            for pool in pools.data:
                if pool.get("name") != "default-dhcp":  # Skip default DHCP pool
                    self.client._send_request("/ip/pool/remove", {".id": pool.get(".id")})
        results["clear_pools"] = True

        # 6. Remove PPP profiles (except default)
        profiles = self.client._send_request("/ppp/profile/print")
        if profiles.success and profiles.data:
            for profile in profiles.data:
                if profile.get("name") != "default":  # Skip default profile
                    self.client._send_request("/ppp/profile/remove", {".id": profile.get(".id")})
        results["clear_profiles"] = True

        return results

    def initialize_site(self, site_id: str, setup_type: str = "hotspot",
                        lan_interfaces: list = None) -> dict:
        """
        Initialize a site with clean configuration

        Args:
            site_id: Unique site identifier
            setup_type: 'hotspot' or 'pppoe'
            lan_interfaces: List of interfaces to include in bridge

        Returns:
            Dictionary with setup results
        """
        # 1. Clear existing configuration
        # clear_results = self.clear_existing_configuration()

        # 2. Apply selected setup
        if setup_type.lower() == "hotspot":
            setup_results = self.setup_hotspot_site(site_id, lan_interfaces)
        elif setup_type.lower() == "pppoe":
            setup_results = self.setup_pppoe_site(site_id, lan_interfaces)
        else:
            return {"error": "Invalid setup type. Use 'hotspot' or 'pppoe'"}

        # 3. Combine results
        return {
            "setup": setup_results
        }

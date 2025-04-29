import requests

from easy_client import Network, MikrotikClient


class MTKClient:
    def __init__(self, server_url, host, username, password):
        client = MikrotikClient(server_url, username, password, host=host)
        self.network = Network(client)


class MikroManager:
    mikrotik: "MikroManager" = None

    def __init__(self, api_key, server_id, server_url):
        self.api_key = api_key
        self.server_url = server_url
        self.server_id = server_id

    @classmethod
    def initialise(cls, api_key, server_id, server_url) -> None:
        cls.mikrotik = MikroManager(api_key, server_id, server_url)

    def connect_router(self, host, username, password) -> 'RouterConnection':
        """Create a router connection instance"""
        return RouterConnection(self.api_key, self.server_url + "/mtk/console", host, username, password,
                                self.server_id)

    def client(self, *, host, username, password) -> 'MTKClient':
        return MTKClient(self.server_url, host, username, password)


class RouterConnection:
    def __init__(self, api_key, server_url, router_ip, username, password, server_id):
        self.sever_id = server_id
        self.api_key = api_key
        self.server_url = server_url
        self.router_credentials = {
            "host": router_ip,
            "username": username,
            "password": password
        }

    def _send_request(self, action, params=None):
        """Internal method to send requests to the Flask server"""
        data = {
            "api_key": self.api_key,
            "server_id": self.sever_id,
            "router": self.router_credentials,
            "action": action,
            "params": params or {}
        }
        print(self.server_url,data)

        response = requests.post(self.server_url, json=data)
        return response.json()

    # PPPoE Server Management
    def setup_pppoe_server(self, interface, ip_pool_name,
                           ip_pool_range,
                           lan_interfaces: list = None,
                           dns_servers=None):
        """Set up a complete PPPoE server with one call"""
        return self._send_request("setup_pppoe_server", {
            "interface": interface,
            "ports": lan_interfaces or ["ether2", "ether3", "ether4"],
            "ip_pool_name": ip_pool_name,
            "ip_pool_range": ip_pool_range,
            "dns_servers": dns_servers or ["8.8.8.8", "8.8.4.4"]
        })

    # Client Management
    def add_client(self, username, password, profile_name, service="pppoe"):
        """Add a new client with specified service type and profile"""
        return self._send_request("add_client", {
            "username": username,
            "password": password,
            "profile_name": profile_name,
            "service": service  # pppoe or hotspot
        })

    def remove_client(self, username, service="pppoe"):
        """Remove an existing client"""
        return self._send_request("remove_client", {
            "username": username,
            "service": service
        })

    # Client Profile Management (subscription packages)
    def create_profile(self, name, rate_limit=None, session_timeout=None, service="pppoe"):
        """Create a new service profile (subscription package)"""
        return self._send_request("create_profile", {
            "name": name,
            "rate_limit": rate_limit,  # Format: "10M/5M" for 10Mbps down, 5Mbps up
            "session_timeout": session_timeout,
            "service": service
        })

    def remove_profile(self, name, service="pppoe"):
        """Remove an existing service profile"""
        return self._send_request("remove_profile", {
            "name": name,
            "service": service
        })   

    # Hotspot Server Management
    def setup_hotspot_server(self, interface, network, dns_name, ip_pool=None):
        """Set up a complete hotspot server with one call"""
        return self._send_request("setup_hotspot_server", {
            "interface": interface,
            "network": network,
            "dns_name": dns_name,
            "ip_pool": ip_pool
        })

    # Client Monitoring
    def get_active_clients(self, service="pppoe"):
        """Get a list of currently connected clients"""
        return self._send_request("get_active_clients", {
            "service": service
        })

    # Bandwidth Usage
    def get_client_usage(self, username, service="pppoe"):
        """Get bandwidth usage for a specific client"""
        return self._send_request("get_client_usage", {
            "username": username,
            "service": service
        })

    def customize_hotspot_login_page(self, title, background_color=None, logo_url=None):
        """Customize the hotspot login page appearance"""
        return self._send_request("customize_hotspot_login_page", {
            "title": title,
            "background_color": background_color,
            "logo_url": logo_url
        })

    # Hotspot User Management
    def add_hotspot_user(self, username, password, profile_name, limit_uptime=None, limit_bytes=None):
        """Add a new hotspot user with optional time or data limits"""
        return self._send_request("add_hotspot_user", {
            "username": username,
            "password": password,
            "profile_name": profile_name,
            "limit_uptime": limit_uptime,  # Format: "5h" for 5 hours
            "limit_bytes": limit_bytes  # Format: "1000000000" for ~1GB
        })

    def generate_hotspot_vouchers(self, profile_name, count=1, prefix="", length=6, uptime_limit=None):
        """Generate hotspot vouchers (codes) for quick distribution"""
        return self._send_request("generate_hotspot_vouchers", {
            "profile_name": profile_name,
            "count": count,
            "prefix": prefix,
            "length": length,
            "uptime_limit": uptime_limit
        })

    def list_hotspot_users(self):
        """List all hotspot users"""
        return self._send_request("list_hotspot_users")

    def remove_hotspot_user(self, username):
        """Remove a hotspot user"""
        return self._send_request("remove_hotspot_user", {
            "username": username
        })

    # Hotspot User Profiles
    def create_hotspot_profile(self, name, rate_limit=None, session_timeout=None, idle_timeout=None, shared_users=None):
        """Create a hotspot user profile with specified parameters"""
        return self._send_request("create_hotspot_profile", {
            "name": name,
            "rate_limit": rate_limit,  # Format: "10M/5M"
            "session_timeout": session_timeout,  # Format: "1d" or "24h"
            "idle_timeout": idle_timeout,  # Format: "15m"
            "shared_users": shared_users  # Number of simultaneous logins
        })

    def list_hotspot_profiles(self):
        """List all hotspot user profiles"""
        return self._send_request("list_hotspot_profiles")

    # Walled Garden (allowing access to specific sites without login)
    def add_walled_garden_site(self, domain):
        """Add a site to the walled garden (accessible without login)"""
        return self._send_request("add_walled_garden_site", {
            "domain": domain
        })

    def remove_walled_garden_site(self, domain):
        """Remove a site from the walled garden"""
        return self._send_request("remove_walled_garden_site", {
            "domain": domain
        })

    def list_walled_garden_sites(self):
        """List all walled garden entries"""
        return self._send_request("list_walled_garden_sites")

    # Hotspot Monitoring
    def get_active_hotspot_users(self):
        """Get a list of currently connected hotspot users"""
        return self._send_request("get_active_hotspot_users")

    def disconnect_hotspot_user(self, username):
        """Force disconnect a currently connected hotspot user"""
        return self._send_request("disconnect_hotspot_user", {
            "username": username
        })

    def get_hotspot_usage_report(self, period="daily"):
        """Get usage statistics for the hotspot"""
        return self._send_request("get_hotspot_usage_report", {
            "period": period  # daily, weekly, monthly
        })

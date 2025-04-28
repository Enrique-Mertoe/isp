from ISP.settings import API_URL
from easy_client import MikrotikClient, SpeedLimit
from easy_client.server import SiteSetup
from mtk_command_api.mtk import MikroManager

client = MikrotikClient(
    api_url=API_URL,
    username="lom_tech_user",
    host="Lom_Technology_MikroTik12",
    password="111",
    api_key="your_api_key"  # Optional if API key is not required
)

# Initialize the manager with your API key and server URL
mikrotik = MikroManager(
    api_key="test-api-key",
    server_id="LomTech",
    server_url=f"{API_URL}/mtk/console"
)

# Connect to a specific router
router = mikrotik.connect_router(
    host="Lom_Technology_MikroTik12",
    username="lom_tech_user",
    password="Q8P8Kpd1VJNYKgfg"
)
# print(router)
#
# # Set up a hotspot server
# c = router.setup_hotspot_server(
#     interface="ether2",
#     network="192.168.10.0/24",
#     dns_name="my-isp-hotspot",
#     ip_pool="192.168.10.10-192.168.10.254"
# )
# print(c)
d = router.setup_pppoe_server(
    "bridge", "ip_pool_1", "192.168.10.2-192.168.10.254",

)
print(d)
#
# # Create a hotspot profile
# router.create_hotspot_profile(
#     name="basic-wifi",
#     rate_limit="5M/2M",
#     session_timeout="1d",
#     shared_users="3"
# )
#
# # Add walled garden sites (accessible without login)
# router.add_walled_garden_site("facebook.com")
# router.add_walled_garden_site("wikipedia.org")
#
# # Generate vouchers for quick distribution
# vouchers = router.generate_hotspot_vouchers(
#     profile_name="basic-wifi",
#     count=10,
#     prefix="WIFI-",
#     length=8,
#     uptime_limit="24h"
# )
#
# # Check active hotspot users
# active_users = router.get_active_hotspot_users()
# print(active_users)
#
# # Generate a usage report
# usage_report = router.get_hotspot_usage_report(period="weekly")
# print(usage_report)

#
# def create_internet_packages():
#     # Create a basic package with 1Mbps speed
#     basic_package = client.internet_packages.create(
#         name="Basic",
#         speed_limit=SpeedLimit.BASIC_1M,
#         dns_servers=["8.8.8.8", "8.8.4.4"]
#     )
#     print(f"Created Basic package: {basic_package}")
#
#     # Create a premium package with 10Mbps download, 5Mbps upload
#     premium_package = client.internet_packages.create(
#         name="Premium",
#         speed_limit=SpeedLimit.PREMIUM_10M,
#         dns_servers=["8.8.8.8", "8.8.4.4"],
#         session_timeout="1d"  # 1 day session timeout
#     )
#
#     print(f"Created Premium package: {premium_package}")
#
#     # Create a custom package with 15Mbps download, 7Mbps upload
#     custom_package = client.internet_packages.create(
#         name="CustomPlus",
#         speed_limit=SpeedLimit.custom("15M", "7M"),
#         dns_servers=["8.8.8.8", "8.8.4.4"]
#     )
#     print(f"Created Custom package: {custom_package}")
#
#
# # Example 2: Manage customers (PPP secrets)
# def manage_customers():
#     # Add a new customer with the Premium package
#     new_customer = client.customers.create(
#         username="john.doe",
#         password="secure_password",
#         package="Premium",
#         comment="John Doe - Premium Customer - Contract #12345"
#     )
#     print(f"Added customer: {new_customer.success}")
#
#     # List all customers
#     all_customers = client.customers.list_all()
#     if all_customers.success:
#         print(f"Total customers: {len(all_customers.data)}")
#
#     # Update a customer's package
#     update_result = client.customers.update(
#         username="john.doe",
#         profile="CustomPlus"  # Upgrade to CustomPlus package
#     )
#     print(f"Updated customer package: {update_result.success}")
#
#     # List active customer connections
#     active = client.customers.get_active_connections()
#     if active.success:
#         print(f"Active connections: {len(active.data)}")
#         for conn in active.data:
#             print(f"  - {conn.get('name')} from {conn.get('address')}")
#
#
# # Example 3: Set up a hotspot for guest access
# def setup_hotspot():
#     # Create address pool for hotspot clients
#     pool_result = client.network.create_address_pool(
#         name="hotspot_pool",
#         ranges=["192.168.10.2-192.168.10.254"]
#     )
#     print(f"Created address pool: {pool_result.success}")
#
#     # Create a hotspot profile with time-limited access
#     # Create a hotspot profile with time-limited access
#     profile_result = client.hotspot.create_profile(
#         name="Guests",
#         speed_limit=SpeedLimit.BASIC_1M,
#         session_timeout="1h",  # 1 hour session timeout
#         idle_timeout="5m"  # 5 minute idle timeout
#     )
#     print(f"Created hotspot profile: {profile_result.success}")
#
#     # Set up the hotspot on the LAN interface
#     hotspot_result = client.hotspot.setup(
#         interface="ether2",
#         address="192.168.10.1/24",
#         pool="hotspot_pool"
#     )
#     print(f"Set up hotspot: {hotspot_result.success}")
#
#     # Create a guest user
#     user_result = client.hotspot.create_user(
#         name="guest",
#         password="welcome123",
#         profile="Guests"
#     )
#     print(f"Created hotspot user: {user_result.success}")
#
#
# # Example 4: Network configuration
# def configure_network():
#     # List all interfaces
#     interfaces = client.network.list_interfaces()
#     if interfaces.success:
#         print("Available interfaces:")
#         for interface in interfaces.data:
#             print(f"  - {interface.get('name')}: {interface.get('type')}")
#
#     # Add a new IP address to an interface
#     ip_result = client.network.add_ip_address(
#         address="10.0.0.1/24",
#         interface="ether3"
#     )
#     print(f"Added IP address: {ip_result.success}")
#
#
# # Example 5: System management
# def manage_system():
#     # Get system resources
#     resources = client.system.get_resources()
#     # client.customers.
#     if resources.success:
#         system_info = resources.data[0]
#         print(f"Router model: {system_info.get('board-name')}")
#         print(f"CPU load: {system_info.get('cpu-load')}%")
#         print(f"Free memory: {system_info.get('free-memory')} bytes")
#
#     # Set router identity (hostname)
#     identity_result = client.system.set_identity(name="ISP-Router-Main")
#     print(f"Set router identity: {identity_result.success}")
#
#
# # Example 6: Error handling
# def error_handling_example():
#     # Try to get a non-existent customer
#     non_existent = client.customers.get("non_existent_user")
#     if not non_existent.success:
#         print(f"Error occurred: {non_existent.error_code} - {non_existent.error_message}")
#
#     # Try to create a package with invalid parameters
#     invalid_package = client.internet_packages.create(
#         name="Invalid-Name@",  # Invalid character in name
#         speed_limit="invalid"  # Invalid speed limit format
#     )
#     if not invalid_package.success:
#         print(f"Error creating package: {invalid_package.error_code}")
#         print(f"Error message: {invalid_package.error_message}")
#
#
# # Run the examples
# if __name__ == "__main__":
#     # print("=== Creating Internet Packages ===")
#     # create_internet_packages()
#     #
#     # print("\n=== Managing Customers ===")
#     # manage_customers()
#     #
#     # print("\n=== Setting Up Hotspot ===")
#     # setup_hotspot()
#     #
#     # print("\n=== Configuring Network ===")
#     # configure_network()
#     #
#     # print("\n=== System Management ===")
#     # manage_system()
#     #
#     # print("\n=== Error Handling ===")
#     # error_handling_example()
#
#     # Create site setup manager
#     site_manager = SiteSetup(client)
#     #
#     # # For a hotspot site
#     # results = site_manager.setup_hotspot_site("SITE001")
#     # print(f"Hotspot setup successful: {all(results.values())}")
#     #
#     # # Or for a PPPoE site
#     # results = site_manager.setup_pppoe_site("SITE002")
#     # print(f"PPPoE setup successful: {all(results.values())}")
#     results = site_manager.initialize_site(
#         site_id="SITE001",
#         setup_type="pppoe",
#         lan_interfaces=["ether2", "ether3", "ether4"]
#     )
#
#     # Check if initialization was successful
#     if all(results["clear"].values()) and all(results["setup"].values()):
#         print(f"Site initialized successfully")
#     else:
#         print("Initialization encountered issues")
#
#
# # # create_internet_packages()
# # # manage_customers()
# # setup_hotspot()

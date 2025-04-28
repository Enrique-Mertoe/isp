"""
MikroTik Client Utilities

Helper classes and functions for the MikroTik Easy Client package.
"""

from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass
from enum import Enum
import datetime
import ipaddress


# Data classes for common MikroTik objects

@dataclass
class CustomerUsage:
    """Represents bandwidth usage stats for a customer"""
    username: str
    download_bytes: int
    upload_bytes: int
    session_time: str
    last_seen: datetime.datetime = None

    @property
    def download_mb(self) -> float:
        """Download usage in megabytes"""
        return self.download_bytes / (1024 * 1024)

    @property
    def upload_mb(self) -> float:
        """Upload usage in megabytes"""
        return self.upload_bytes / (1024 * 1024)

    @classmethod
    def from_dict(cls, data: Dict) -> 'CustomerUsage':
        """Create CustomerUsage from RouterOS data"""
        return cls(
            username=data.get("name"),
            download_bytes=int(data.get("bytes-out", 0)),
            upload_bytes=int(data.get("bytes-in", 0)),
            session_time=data.get("uptime", "00:00:00"),
            last_seen=datetime.datetime.now()
        )


@dataclass
class BillingPackage:
    """Represents a service package with billing information"""
    name: str
    speed_limit: str
    price: float
    is_recurring: bool = True
    billing_cycle: str = "monthly"  # monthly, quarterly, yearly
    description: str = ""
    features: List[str] = None

    def to_profile_params(self) -> Dict:
        """Convert to RouterOS profile parameters"""
        params = {
            "name": self.name,
            "rate-limit": self.speed_limit,
            "comment": f"Price: {self.price} - {self.description}"
        }
        return params


class NetworkUtils:
    """Network utility functions"""

    @staticmethod
    def is_valid_ip(ip: str) -> bool:
        """Check if string is a valid IP address"""
        try:
            ipaddress.ip_address(ip)
            return True
        except ValueError:
            return False

    @staticmethod
    def is_valid_subnet(subnet: str) -> bool:
        """Check if string is a valid subnet"""
        try:
            ipaddress.ip_network(subnet)
            return True
        except ValueError:
            return False

    @staticmethod
    def ip_in_range(ip: str, range_start: str, range_end: str) -> bool:
        """Check if IP is within a range"""
        try:
            ip_int = int(ipaddress.ip_address(ip))
            start_int = int(ipaddress.ip_address(range_start))
            end_int = int(ipaddress.ip_address(range_end))
            return start_int <= ip_int <= end_int
        except ValueError:
            return False


class BandwidthCalculator:
    """Utility for bandwidth and data limit calculations"""

    @staticmethod
    def format_speed(bps: int) -> str:
        """Format bits per second to human readable format"""
        if bps < 1000:
            return f"{bps}bps"
        elif bps < 1000000:
            return f"{bps / 1000:.1f}Kbps"
        elif bps < 1000000000:
            return f"{bps / 1000000:.1f}Mbps"
        else:
            return f"{bps / 1000000000:.1f}Gbps"

    @staticmethod
    def format_data_usage(bytes_used: int) -> str:
        """Format bytes to human readable format"""
        if bytes_used < 1024:
            return f"{bytes_used}B"
        elif bytes_used < 1048576:
            return f"{bytes_used / 1024:.1f}KB"
        elif bytes_used < 1073741824:
            return f"{bytes_used / 1048576:.1f}MB"
        elif bytes_used < 1099511627776:
            return f"{bytes_used / 1073741824:.1f}GB"
        else:
            return f"{bytes_used / 1099511627776:.1f}TB"

    @staticmethod
    def parse_speed_limit(limit: str) -> tuple:
        """Parse MikroTik speed limit format (e.g. '10M/5M')"""
        if not limit or limit == "0/0":
            return (0, 0)  # Unlimited

        try:
            download, upload = limit.split('/')

            # Parse download speed
            if download.endswith('k'):
                download_bps = int(download[:-1]) * 1000
            elif download.endswith('M'):
                download_bps = int(download[:-1]) * 1000000
            elif download.endswith('G'):
                download_bps = int(download[:-1]) * 1000000000
            else:
                download_bps = int(download)

            # Parse upload speed
            if upload.endswith('k'):
                upload_bps = int(upload[:-1]) * 1000
            elif upload.endswith('M'):
                upload_bps = int(upload[:-1]) * 1000000
            elif upload.endswith('G'):
                upload_bps = int(upload[:-1]) * 1000000000
            else:
                upload_bps = int(upload)

            return (download_bps, upload_bps)
        except (ValueError, IndexError):
            return (0, 0)  # Return unlimited on parse error


class ReportGenerator:
    """Generate reports from RouterOS data"""

    @staticmethod
    def active_customers_report(active_data: List[Dict]) -> Dict:
        """Generate a report of active customer connections"""
        total_customers = len(active_data)
        total_download = sum(int(client.get("bytes-out", 0)) for client in active_data)
        total_upload = sum(int(client.get("bytes-in", 0)) for client in active_data)

        services = {}
        for client in active_data:
            service = client.get("service", "unknown")
            if service not in services:
                services[service] = 0
            services[service] += 1

        return {
            "timestamp": datetime.datetime.now().isoformat(),
            "total_active_customers": total_customers,
            "total_download_bytes": total_download,
            "total_upload_bytes": total_upload,
            "total_download_formatted": BandwidthCalculator.format_data_usage(total_download),
            "total_upload_formatted": BandwidthCalculator.format_data_usage(total_upload),
            "services_breakdown": services
        }

    @staticmethod
    def customer_usage_report(customer_data: List[Dict], active_data: List[Dict]) -> List[CustomerUsage]:
        """Generate a usage report for all customers"""
        # Create a mapping of usernames to active connections
        active_map = {client.get("name"): client for client in active_data}

        usages = []
        for customer in customer_data:
            username = customer.get("name")

            # Get active connection data if available
            active_info = active_map.get(username, {})

            usage = CustomerUsage(
                username=username,
                download_bytes=int(active_info.get("bytes-out", 0)),
                upload_bytes=int(active_info.get("bytes-in", 0)),
                session_time=active_info.get("uptime", "00:00:00")
            )
            usages.append(usage)

        return usages

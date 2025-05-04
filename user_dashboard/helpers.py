# serializers.py
import random
import string
from typing import Dict, List, Optional

from django.http import JsonResponse

from mtk_command_api.utility import EthernetInterface, DhcpClient
from .models import Router, Package, User, Payment, Ticket, SystemUser, Client, Billing


def router_to_dict(router: Router):
    return {
        "id": router.id,
        "name": router.name,
        "password": router.password,
        "location": router.location,
        "username": router.username,
        "ip_address": router.ip_address,
        "identity": router.identity,
    }


def pkg_to_dict(pkg: Package):
    return {
        "id": pkg.id,
        "name": pkg.name,
        "duration": pkg.duration,
        "price": pkg.price,
        "upload_speed": pkg.upload_speed,
        "download_speed": pkg.download_speed,
        "speed": pkg.download_speed,
        "type": pkg.type,
        "router": router_to_dict(pkg.router),
        "created": pkg.created_at.isoformat(),
    }


def user_to_dict(user: User):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        # "package": pkg_to_dict(user.package),
        "role": user.role,
        "isp": company_to_dict(user.isp),
        "due_amount": user.due_amount()
    }


def client_to_dict(client: Client):
    return {
        "id": client.id,
        "full_name": client.full_name,
        "phone": client.phone,
        "package": pkg_to_dict(client.package),
        "package_start": client.package_start,
        "router_username": client.router_username,
        "router_password": client.router_password,
        "due": client.due,
        "created_at": client.created_at,
        "isp": client.isp.id
    }


def payment_to_dict(payment: Payment) -> Dict:
    return {
        "id": payment.id,
        "billing_id": payment.billing.id,
        "user_id": payment.user.id,
        "invoice": payment.invoice,
        "payment_method": payment.payment_method,
        "package_price": float(payment.package_price),
        "created_at": payment.created_at.isoformat(),  # or .strftime() if you want a specific format
    }


def ticket_to_dict(ticket: Ticket) -> Dict:
    return {
        "id": ticket.id,
        "subject": ticket.subject,
        "message": ticket.message,
        "status": ticket.status,
        "priority": ticket.priority,
        "user_id": ticket.user.id,
        "number": ticket.number,
    }


def company_to_dict(company: SystemUser):
    if not company:
        return {}
    return {
        "id": company.id,
        "name": company.name,
        "email": company.email,
        "phone": company.phone,
        "address": company.address,
        "role": company.role
    }


def generate_invoice_number():
    while True:
        number = str(random.randint(100000, 999999))
        if not Billing.objects.filter(invoice=number).exists():
            return number


def get_client_provisioning_data(info, server_url):
    return {
        "info": info,
        'server_url': f'{server_url}/provision_content'
    }


def get_host(request):
    host = request.get_host()
    # For production domains, don't add a port
    if '.com' in host or '.org' in host or '.net' in host or '.io' in host:
        return f"{request.scheme}://{host}"

    if ':' not in host:
        host = f"{host}:3700"

    return f"{request.scheme}://{host}"


def generate_key(length=16):
    chars = string.ascii_letters + string.digits  # a-zA-Z0-9
    return ''.join(random.choices(chars, k=length))


def get_mode_from_url(url):
    if url.startswith('https://'):
        return 'https'
    else:
        return 'http'


def get_wan_interface(clients: List[DhcpClient]) -> Optional[DhcpClient]:
    for client in clients:
        if client.status == "bound" and not client.disabled:
            return client
    return None


def transform_ports(data: List['EthernetInterface'], wan: List["DhcpClient"]):
    """
       Transform RouterOS API data into a format suitable for UI
       Returns data in the format matching the Port interface
       """
    ports = []
    port_data = data
    wan = get_wan_interface(wan)
    for port in port_data:
        port_id = port.id.replace('*', '')
        port_name = port.name
        if wan and wan.interface == port_name:
            continue

        # Determine port type
        port_type = 'ethernet'
        if 'sfp' in port_name.lower():
            port_type = 'sfp' if '+' not in port_name else 'sfp+'
        elif 'wlan' in port_name.lower():
            port_type = 'wireless'

        ports.append({
            'id': port_id,
            'name': port_name,
            'type': port_type,
            'mode': None
        })

    return ports, wan.interface if wan else None


def make_response(*, ok=False, error='', message='', data: Dict = None, **kwargs):
    return JsonResponse({
        "ok": ok, "error": error, "message": message, "data": data or {}, **kwargs
    })

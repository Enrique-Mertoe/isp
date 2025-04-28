# serializers.py
import random
import string
from typing import Dict

from .models import Router, Package, User, Payment, Ticket, ISPProvider, Client, Billing


def router_to_dict(router: Router):
    return {
        "id": router.id,
        "name": router.name,
        "password": router.password,
        "location": router.location,
        "username": router.username,
        "ip_address": router.ip_address,
    }


def pkg_to_dict(pkg: Package):
    return {
        "id": pkg.id,
        "name": pkg.name,
        "price": pkg.price,
        "upload_speed": pkg.upload_speed,
        "download_speed": pkg.download_speed,
        "type": pkg.type,
        "router": router_to_dict(pkg.router),
    }


def user_to_dict(user: User):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        # "package": pkg_to_dict(user.package),
        "role": user.role,
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


def company_to_dict(company: ISPProvider):
    if not company:
        return {}
    return {
        "id": company.id,
        "name": company.name,
        "email": company.email,
        "phone": company.phone,
        "address": company.address
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

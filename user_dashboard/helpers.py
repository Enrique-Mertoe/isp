# serializers.py
from .models import Router, Package, User


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

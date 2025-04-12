# serializers.py
from .models import Router


def router_to_dict(router: Router):
    return {
        "id": router.id,
        "name": router.name,
        "password": router.password,
        "location": router.location,
        "ip_address": router.ip_address,
    }

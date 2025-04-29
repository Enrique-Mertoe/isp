import base64
import dataclasses
import datetime
import json
import time
import socket
from urllib.parse import urlparse
from cryptography.fernet import Fernet
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, get_object_or_404
from django.template.loader import render_to_string
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view

from ISP import settings
import requests as req

from user_dashboard.helpers import get_client_provisioning_data, get_host, generate_key, get_mode_from_url
from user_dashboard.models import Router, ISPProvider


@dataclasses.dataclass
class ResponseData:
    error: str | None = None
    status: str | None = None
    message: str | None = None
    task_id: int = 0
    provision_identity: str = None
    secret: str = None
    ip_address: str = None


fernet = Fernet(settings.FERNET_KEY.encode())


@ensure_csrf_cookie
def gen_mtk_provision(request):
    if request.method == 'POST':
        try:
            user = request.user
            router_name = request.POST.get('router_name', 'MTK1')

            # Create a unique identifier using username and a unique number
            router_identity = f"{user.username}_{router_name}"

            # Check if this identity already exists in our database
            existing_router = Router.objects.filter(identity=router_identity).first()
            if existing_router:
                return JsonResponse({
                    "ok": False,
                    "error": f"Router with identity {router_name} already exists."
                })

            mtk_info = {
                "name": router_identity,
                "password": generate_key()
            }

            api_url = settings.API_URL

            # Initial request to create provision
            res = req.post(api_url + f"/mikrotik/openvpn/create_provision/{mtk_info['name']}")
            res = ResponseData(**res.json())
            if res.status in ["error", None]:
                return JsonResponse({
                    "error": f"Something went wrong. {res.message or ''}"
                })

            router = Router.objects.create(
                name=router_name,
                username=settings.MTK_USERNAME,
                password=mtk_info["password"],
                location="ss",
                ip_address="not found",
                secrete=res.task_id,
                isp=ISPProvider.objects.get(user=user.id),
                identity=mtk_info["name"]
            )
            client_info = {
                "mtk": router.id,
                "user": user.username,
            }
            print("getting cient provisioning data ")
            provisioning_data = get_client_provisioning_data(client_info, get_host(request))
            print("provisioning data ", provisioning_data)
            payload = {
                **provisioning_data,
                'timestamp': datetime.datetime.utcnow().isoformat()
            }

            json_payload = json.dumps(payload)
            encrypted_payload = fernet.encrypt(json_payload.encode()).decode()
            encoded_payload = base64.urlsafe_b64encode(encrypted_payload.encode()).decode()

            rsc_file = settings.RSC_FILE
            provisioning_url = f"{provisioning_data['server_url']}/{encoded_payload}/"
            script = f""":do {{
                :local url "{provisioning_url}";

                /tool fetch url=$url dst-path={rsc_file};
                :delay 2s;
                /import {rsc_file};
            }} on-error={{
                :put "Error occurred during configuration. Check internet and retry.";
            }}"""
            return JsonResponse({
                "ok": True,
                "script": str(script), "pvr_url": provisioning_url, "rsc_file": rsc_file
            })
        except Exception as e:
            print(str(e))
            return JsonResponse({
                "ok": False,
                "error": str(e)
            })


@api_view(['GET'])
def provision_content(request, encoded_payload):
    # server_url = get_host(request)
    server_url = settings.API_URL
    provisioning_url = f"{get_host(request)}/provision_content/{encoded_payload}"
    # Render the .rsc file using Django template
    script = render_to_string('rsc_files/lom_config.rsc', {'url': provisioning_url})

    # Create downloadable response
    response = HttpResponse(script, content_type="text/plain")
    response['Content-Disposition'] = 'attachment; filename=script.rsc'
    return response


# def get_ovpn_profile_data(client_id, version):
#     server_url = get_host()
#     return {
#         "client_cert": "beam_1",
#         "client_name": "beam",
#         "client_url": f"{server_url}/mikrotik/openvpn/beam/key/{config['mtk_user']}"
#     }


@dataclasses.dataclass
class ValidPayload:
    mtk: int
    user: str


def validate(encoded_payload) -> ValidPayload:
    encrypted_payload = base64.urlsafe_b64decode(encoded_payload).decode()
    json_payload = fernet.decrypt(encrypted_payload.encode()).decode()
    payload = json.loads(json_payload)
    if not isinstance(payload, dict):
        raise ValueError("Payload is not a valid JSON object.")

    required_keys = ['info', 'server_url', 'timestamp']
    for key in required_keys:
        if key not in payload:
            raise ValueError(f"Missing key: {key}")

    info = payload['info']
    if not isinstance(info, dict):
        raise ValueError("`info` must be a dictionary.")
    if 'mtk' not in info or 'user' not in info:
        raise ValueError("Missing `mtk` or `user` in `info`.")

    if not isinstance(payload['timestamp'], str):
        raise ValueError("`timestamp` must be a string.")
    return ValidPayload(**info)


# @api_view(['GET'])
# def provision_version_content(request, encoded_payload, version):
#     print(validate(encoded_payload))
#     try:
#         info = validate(encoded_payload)
#         print(info)
#         router = get_object_or_404(Router, id=info.mtk)
#         if not router:
#             raise ValueError("No router found")
#
#         # ovpn_data = get_ovpn_profile_data(client_id, version)
#         config = {
#             "firewall": "10.8.0.1",
#             "secret": router.password,
#             "identity": router.identity,
#             "mtk_user": settings.MTK_USERNAME,
#             "vpn_url": f"{settings.API_URL}/mikrotik/openvpn/{router.identity}"
#         }
#         file = "vpn_7_config.rsc" if version == 7 else "vpn_6_config.rsc"
#         script_lines = render_to_string(f'rsc_files/{file}', {
#             'config': config
#         })
#
#         response = HttpResponse(script_lines, content_type='text/plain')
#         response['Content-Disposition'] = 'attachment; filename=script.rsc'
#         return response
#
#     except Exception as e:
#         return HttpResponse(f':put "Failed to generate OpenVPN config: {str(e)}"', content_type='text/plain')

@api_view(["GET"])
def provision_version_content(request, encoded_payload, version):
    try:
        info = validate(encoded_payload)
        router = get_object_or_404(Router, id=info.mtk)
        if not router:
            raise ValueError("No router found")

        # Determine which server IP to use for walled garden
        server_ip = settings.SERVER_IP  # Make sure this is defined in your settings
        url = get_host(request)

        config = {
            "firewall": "10.8.0.1",
            "secret": router.password,
            "identity": router.identity,
            "mtk_user": settings.MTK_USERNAME,
            "vpn_url": f"{settings.API_URL}/mikrotik/openvpn/{router.identity}",
            "hs_login_url": f"{url}/mikrotik/hotspot/{router.identity}/login.html",
            "hs_rlogin_url": f"{url}/mikrotik/hotspot/{router.identity}/rlogin.html",
            "walled_garden_host": settings.HOSTNAME,
            "walled_garden_ip": server_ip,
        }
        config["mode"] = get_mode_from_url(config["hs_login_url"])

        # For RouterOS v6, we need additional parameters
        if version == 6:
            config.update({
                "connect_to": settings.VPN_SERVER_IP,
                "vpn_pass": router.password,
                "client_cert": f"{router.identity}.config_1"
            })

        file = "vpn_7_config.rsc" if version == 7 else "vpn_6_config.rsc"
        script_lines = render_to_string(f'rsc_files/{file}', {
            'config': config
        })

        response = HttpResponse(script_lines, content_type='text/plain')
        response['Content-Disposition'] = 'attachment; filename=script.rsc'
        return response

    except Exception as e:
        return HttpResponse(f':put "Failed to generate OpenVPN config: {str(e)}"', content_type='text/plain')


@api_view(["GET"])
def serve_hotspot_file(request, router_identity, file_name):
    try:
        router = get_object_or_404(Router, identity=router_identity)

        if file_name == 'login.html':
            template_name = 'hotspot/login1.html'
        elif file_name == 'rlogin.html':
            template_name = 'hotspot/rlogin.html'
        else:
            return HttpResponse("File not found", status=404)

        # Context data for the template
        context = {
            'url': get_host(request) + "/hotspot/packages",
            'router': router,
            'isp_name': settings.ISP_NAME,
            'support_phone': settings.SUPPORT_PHONE,
            'year': datetime.datetime.now().year
        }
        response = HttpResponse(render(request, template_name, context), content_type='text/plain')
        response['Content-Disposition'] = 'attachment; filename=script.rsc'

        return response

    except Exception as e:
        return HttpResponse(f':put "Failed to serve hotspot files: {str(e)}"', content_type='text/plain')

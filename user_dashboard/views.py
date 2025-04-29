from datetime import timedelta

import requests
import routeros_api as r_os
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import transaction
from django.db.models import Q
from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django.views import View
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import json, re
from ISP import settings
from mtk_command_api.mtk import MikroManager
from user_dashboard.helpers import router_to_dict, pkg_to_dict, user_to_dict, company_to_dict, client_to_dict, \
    generate_invoice_number, transform_ports
from user_dashboard.models import Router, Package, ISPProvider, Client, Billing
from ISP.settings import mikrotik_manager


# Create your views here.
@login_required
def home(request):
    return render(request, 'index.html')


@api_view(["POST", "GET"])
@ensure_csrf_cookie
def set_csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})


def start_app(request):
    if request.method == "POST":
        users = Client.objects.filter(isp=request.user.id).count()
        pakgs = Package.objects.filter(Q(
            router__isp__user=request.user.id
        )).count()
        routers = Router.objects.filter(isp__user=request.user.id).count()
        return JsonResponse({
            "users": users,
            "user": user_to_dict(request.user),
            "packages": pakgs,
            "routers": routers,
        }, safe=False)


# Router controller
def router_page(request):
    return render(request, 'index.html')


def router_list(request):
    if request.method == "POST":
        load_type = request.POST.get("load_type", "all")
        # search = request.data.get("search", "")
        #
        # if search:
        #     routers = routers.filter(
        #         Q(name__icontains=search) | Q(ip_address__icontains=search)
        #     )

        user_router = Router.objects.filter(Q(
            isp__user=request.user.id
        ))

        print("routers", user_router)
        if load_type == "active":
            routers = user_router.filter(active=True)
        elif load_type == "inactive":
            routers = user_router.filter(active=False)
        else:
            routers = user_router.all()

        if (routers.count() == 0):
            return JsonResponse({
                "routers": [],
                "all_count": 0,
                "active_count": 0,
                "inactive_count": 0,
            }, safe=False)

        routers_data = [router_to_dict(router) for router in routers]

        # Always calculate total counts
        all_count = user_router.count()
        active_count = user_router.filter(active=True).count()
        inactive_count = user_router.filter(active=False).count()

        return JsonResponse({
            "routers": routers_data,
            "all_count": all_count,
            "active_count": active_count,
            "inactive_count": inactive_count,
        }, safe=False)


@csrf_exempt
def router_create(request):
    if request.method == "POST":
        try:
            data = request.POST
            company = ISPProvider.objects.get(user=request.user)
            if not company:
                return JsonResponse({'error': "Update company information first"}, status=400)

            conn = r_os.RouterOsApiPool(host=data.get('ip'),
                                        password=data.get('password'),
                                        username=data.get('username'),
                                        plaintext_login=True)

            try:
                conn.get_api()
            except:
                return JsonResponse({'error': "Router is unreachable ensure you "
                                              "have the correct IP Address and credentials."}, status=400)

            router = Router.objects.create(
                name=data.get('name'),
                password=data.get('password'),
                location=data.get('location'),
                username=data.get('username'),
                ip_address=data.get('ip'),
                isp=ISPProvider.objects.get(user=request.user.id)
            )
            return JsonResponse(router_to_dict(router), status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return HttpResponseBadRequest()


@csrf_exempt
def router_detail(request, pk):
    router = get_object_or_404(Router, pk=pk)
    if request.method == "GET":
        return JsonResponse(router_to_dict(router))
    return HttpResponseBadRequest()


@csrf_exempt
def router_update(request, pk):
    router = get_object_or_404(Router, pk=pk)
    if request.method == "POST":
        try:
            data = request.POST
            router.name = data.get('name', router.name)
            router.username = data.get('username', router.username)
            router.password = data.get('password', router.password)
            router.location = data.get('location', router.location)
            router.ip_address = data.get('ip', router.ip_address)
            router.save()
            print(router_to_dict(router))
            return JsonResponse(router_to_dict(router))
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return HttpResponseBadRequest()


@csrf_exempt
def router_delete(request, pk):
    router = get_object_or_404(Router, pk=pk)
    if request.method == "DELETE":
        router.delete()
        return JsonResponse({'message': 'Router deleted successfully.'})
    return HttpResponseBadRequest()


# @csrf_exempt
def router_count(request):
    count = Router.objects.filter(isp__user=request.user).count()
    return JsonResponse({'ok': True, "count": count})


@api_view(['POST'])
def router_interfaces(request):
    rt = get_object_or_404(Router, identity=f"{request.user.username}_{request.POST.get('router') or 'MikroTik38'}")
    network = mikrotik_manager.mikrotik.client(host=rt.identity, username=settings.MTK_USERNAME,
                                           password=rt.password).network
    intf = network.list_ports()
    print(intf)
    return JsonResponse({'ok': True, "ports": transform_ports(intf.data or [])})


@api_view(["GET"])
def check_connection(request, mtk):
    user = request.user
    router_identity = f"{user.username}_{mtk}"
    routerExisting=get_object_or_404(Router, identity=router_identity)
    ip = requests.get(settings.API_URL + f"/mikrotik/openvpn/client_ip/{router_identity}").text.strip()
    if ip.startswith("10.8.0"):
        print(ip)
        routerExisting.ip_address = ip  
        routerExisting.save()
        return JsonResponse({'ok': True, "ip": ip, "status": "connected"})
    return JsonResponse({'ok': False})


# packages views

def pkg_page(request):
    return render(request, 'index.html')


def pkg_list(request):
    if request.method == "POST":
        load_type = request.POST.get("load_type", "all")
        user_pkgs = Package.objects.filter(Q(
            router__isp__user=request.user.id
        ))

        if load_type in ["hotspot", "pppoe"]:
            pkgs = user_pkgs.filter(type=load_type)
        else:
            pkgs = user_pkgs.all()

        pkgs_data = [pkg_to_dict(pkg) for pkg in pkgs]

        # Always calculate total counts
        all_count = user_pkgs.count()
        h_count = user_pkgs.filter(type="hotspot").count()
        p_count = user_pkgs.filter(type="pppoe").count()

        return JsonResponse({
            "pkgs": pkgs_data,
            "all_count": all_count,
            "pppoe_count": p_count,
            "hotspot_count": h_count,
        }, safe=False)


def format_data(data: str) -> str:
    match = re.match(r'(\d+)', data)
    print(data)
    if match:
        number = match.group(1)
        return f"{number}M"
    return "0M"  # or raise an error if you prefer


@csrf_exempt
def pkg_create(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            print(data)
            print(request.user)
            router = Router.objects.get(id=data['router_id'], identity=data['router_identity'])
            print('hbh', router)
            if not router:
                print('unrecognized ')
                return JsonResponse({'error': "Unrecognised router."}, status=400)

            try:
                # rate_limit = f"{data['speed']}/{data.get('speed')}"
                # api = router.connection()
                # api.get_resource("ppp/profile").add(name=data.get('name'),
                #                                     dns_server="8.8.8.8,8.8.4.4",
                #                                     only_one='yes',
                #       
                print(data['speed'], 'im here')
                ratelimit = format_data(data['speed']) + "/" + format_data(data['speed'])
                print(ratelimit)
                res=mikrotik_manager.connect_router(host=router.identity,username=router.username,password=router.password)
                    # def create_profile(self, name, rate_limit=None, session_timeout=None, service="pppoe"):
                print(res,'bbbhbhbh')
                res.create_profile(name=router.name,rate_limit=ratelimit,session_timeout=data.get("duration"),service="pppoe")
                # res = mikrotik_manager.connect_router(router.identity, router.username, router.password)
                # def create_profile(self, name, rate_limit=None, session_timeout=None, service="pppoe"):
                print(res, 'bbbhbhbh')
                res.create_profile(name=data['name'], rate_limit=ratelimit, session_timeout=data.get("duration"),
                                   service="pppoe")
            except Exception as e:
                print(str(e))
                return JsonResponse({'error': "Router connection failed"}, status=400)

            pkg = Package.objects.create(
                name=data['name'],
                type=data['type'],
                upload_speed=data['speed'],
                download_speed=data['speed'],
                price=data['price'],
                router=router
            )
            return JsonResponse(pkg_to_dict(pkg), status=201)
        except Exception as e:
            print(str(e))
            return JsonResponse({'error': str(e)}, status=400)
    return HttpResponseBadRequest()


@csrf_exempt
def pkg_detail(request, pk):
    router = get_object_or_404(Router, pk=pk)
    if request.method == "GET":
        return JsonResponse(router_to_dict(router))
    return HttpResponseBadRequest()


@csrf_exempt
def pkg_update(request, pk):
    router = get_object_or_404(Router, pk=pk)
    if request.method == "PUT" or request.method == "PATCH":
        try:
            data = request.POST
            router.name = data.get('name', router.name)
            router.password = data.get('password', router.password)
            router.location = data.get('location', router.location)
            router.ip_address = data.get('ip_address', router.ip_address)
            router.save()
            return JsonResponse(router_to_dict(router))
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return HttpResponseBadRequest()


# @csrf_exempt
# def pkg_delete(request, pk):
#     router = get_object_or_404(Router, pk=pk)
#     if request.method == "DELETE":
#         router.delete()
#         return JsonResponse({'message': 'Router deleted successfully.'})
#     return HttpResponseBadRequest()


@csrf_exempt
def pkg_delete(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            pkg_id = data.get('id')
            
            # Get the package from database
            try:
                pkg = Package.objects.get(id=pkg_id)
            except Package.DoesNotExist:
                return JsonResponse({'error': "Package not found"}, status=404)
            
            # Get the router
            router = pkg.router
            
            # Remove profile from router
            try:
                res = mikrotik_manager.connect_router(
                    host=router.identity,
                    username=router.username,
                    password=router.password
                )
                
                # Remove the profile from the router
                res.remove_profile(name=pkg.name, service="pppoe")
            except Exception as e:
                print(str(e))
                return JsonResponse({'error': "Failed to remove profile from router"}, status=400)
            
            # Delete from database
            pkg.delete()
            
            return JsonResponse({'success': True, 'message': f"Package '{pkg.name}' deleted successfully"}, status=200)
            
        except Exception as e:
            print(str(e))
            return JsonResponse({'error': str(e)}, status=400)
    
    return HttpResponseBadRequest()

# user views
def user_page(request):
    return render(request, 'index.html')


def user_list(request):
    if request.method == "POST":
        load_type = request.POST.get("load_type", "all")
        # search = request.data.get("search", "")
        #
        # if search:
        #     routers = routers.filter(
        #         Q(name__icontains=search) | Q(ip_address__icontains=search)
        #     )

        if load_type in ["hotspot", "pppoe"]:
            users = Client.objects.filter(
                Q(package__type=load_type)
            )
        else:
            users = Client.objects.all()

        users_data = [client_to_dict(user) for user in users]

        # Always calculate total counts
        all_count = Client.objects.filter(isp=request.user.id).count()
        h_count = Client.objects.filter(
            Q(package__type="hotspot")
        ).count()
        p_count = Client.objects.filter(
            Q(package__type="pppoe")
        ).count()

        return JsonResponse({
            "users": users_data,
            "all_count": all_count,
            "pppoe_count": p_count,
            "hotspot_count": h_count,
        }, safe=False)


@csrf_exempt
def user_create(request):
    if request.method == "POST":
        data = request.POST
        print(data)
        try:
            package = Package.objects.get(id=data['package'])
            router = package.router
        except Package.DoesNotExist:
            return JsonResponse({'error': 'Package not found'}, status=400)
        except Router.DoesNotExist:
            return JsonResponse({'error': 'Router not found'}, status=400)
        if Client.objects.filter(router_username=data['username']).exists():
            return JsonResponse(
                {'error': f"Client: {data['username']} already in use for router {package.router.name}"},
                status=400)

        try:
            api = router.connection()

            api.get_resource('/ppp/secret').add(
                name=data['username'],
                password=data['password'],
                service=data.get('user_type', 'any'),
                profile=package.name
            )
        except Exception as e:
            return JsonResponse({'error': "MikroTik connection failed"}, status=400)

        try:
            with transaction.atomic():
                Client.objects.create(
                    phone=data.get('phone'),
                    full_name=data.get('full_name'),
                    isp=request.user,
                    package=package,
                    router_username=data.get('username'),
                    router_password=data.get('password'),
                    due=data.get('expiry_date') or timezone.now() + timedelta(days=30),
                    # Default to 30 days if not provided
                    package_start=timezone.now()
                )

                Billing.objects.create(
                    invoice=generate_invoice_number(),
                    package_name=package.name,
                    package_price=package.price,
                    package_start=timezone.now().date(),
                    user=request.user
                )
                return JsonResponse({'error': "User created successfully"}, status=201)

        except Exception as e:
            print(e)
            return JsonResponse({'error': "Error creating client"}, status=400)
    return HttpResponseBadRequest()


@csrf_exempt
def user_detail(request, pk):
    router = get_object_or_404(Router, pk=pk)
    if request.method == "GET":
        return JsonResponse(router_to_dict(router))
    return HttpResponseBadRequest()


@csrf_exempt
def user_update(request, pk):
    router = get_object_or_404(Router, pk=pk)
    if request.method == "PUT" or request.method == "PATCH":
        try:
            data = request.POST
            router.name = data.get('name', router.name)
            router.password = data.get('password', router.password)
            router.location = data.get('location', router.location)
            router.ip_address = data.get('ip_address', router.ip_address)
            router.save()
            return JsonResponse(router_to_dict(router))
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return HttpResponseBadRequest()


@csrf_exempt
def user_delete(request, pk):
    router = get_object_or_404(Router, pk=pk)
    if request.method == "DELETE":
        router.delete()
        return JsonResponse({'message': 'Router deleted successfully.'})
    return HttpResponseBadRequest()


class CompanyEditView(LoginRequiredMixin, View):
    def get(self, request):
        fetch = request.GET.get('api')
        if not fetch:
            return render(request, 'index.html')
        company = ISPProvider.objects.filter(user=request.user.id).first()
        return JsonResponse({'company': company_to_dict(company)})

    def post(self, request):
        data = request.POST
        print(data)
        try:
            c = ISPProvider.objects.get(user=request.user)
            if not c:
                c = ISPProvider.objects.create(user=request.user,
                                               address=data.get('address'),
                                               phone=data.get('phone'),
                                               email=data.get('email'),
                                               name=data.get('name'),
                                               )
            else:
                c.address = data.get('address')
                c.phone = data.get('phone')
                c.email = data.get('email')
                c.name = data.get('name')
                c.save()
            return JsonResponse(company_to_dict(c), status=201)

        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=400)


class MTKView(View):
    def get(self, request):
        return render(request, 'index.html')

    def post(self, request, pk):
        router = get_object_or_404(Router, id=pk)
        conn = router.connection()
        if not conn:
            return JsonResponse({
                "error": "Router connection failed."
            }, status=401)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_packages(request):
    """
    Get all packages associated with the logged-in user
    """
    try:
        # Get the client associated with the logged-in user
        client = Client.objects.get(user=request.user)

        # Get all packages associated with the client
        packages = client.packages.all()

        # Serialize the packages
        serializer = PackageSerializer(packages, many=True)

        return Response({
            'status': 'success',
            'data': serializer.data
        })
    except Client.DoesNotExist:
        raise
        return Response({
            'status': 'error',
            'message': 'Client profile not found'
        }, status=404)
    except Exception as e:
        raise
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)


@api_view(["GET", "POST"])
def hotspot_packages(request):
    return render(request, "hotspot/packages.html")

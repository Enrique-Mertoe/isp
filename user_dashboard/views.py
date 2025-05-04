from datetime import timedelta
import random
import string
from decouple import config
import requests
import routeros_api as r_os
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.paginator import Paginator
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
from intasend import APIService
from ISP import settings
from mtk_command_api.mtk import MikroManager
from user_dashboard.helpers import router_to_dict, pkg_to_dict, user_to_dict, company_to_dict, client_to_dict, \
    generate_invoice_number, transform_ports
from user_dashboard.models import Router, Package, SystemUser, Client, Billing
from user_dashboard.models import Router, Package, ISPProvider, Client, Billing ,ISPAccountPayment
from ISP.settings import mikrotik_manager
import uuid


# Create your views here.
@login_required
def home(request):
    return render(request, 'index.html')


def generate_password(name: str) -> str:
    # Generate 4 random alphanumeric characters
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
    # Combine the name with the random suffix
    return f"{name}_{random_suffix}"


@api_view(["POST", "GET"])
@ensure_csrf_cookie
def set_csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

# views.py
@csrf_exempt
def initiate_payment(request):
    if request.method == 'POST':
        try:
            # Parse request data
            data = json.loads(request.body)
            payment_method = data.get('payment_method')
            amount = data.get('amount', 0)
            currency = data.get('currency', 'KES')

            # Get user information
            # user = request.user
            user=request.user.isp
            # user=ISPProvider.objects.get(id=3)
            # In production, use authenticated user info
            # email = user.email if user.is_authenticated else data.get('email', '')
            # phone_number = user.profile.phone if hasattr(user, 'profile') and hasattr(user.profile, 'phone') else data.get('phone_number', '')

            # For demo purposes
            email = user.email
            phone_number = user.phone

            # Initialize IntaSend service
            publishable_key = config("INTASEND_PUBLISHABLE_KEY")
            secret_key = config("INTASEND_SECRET_KEY")
            service = APIService(
                token=secret_key,
                publishable_key=publishable_key,
                test=True  # Set to False in production
            )

            # Create a payment record in our system first
            payment = ISPAccountPayment.objects.create(
                user=user,
                amount=amount,
                currency=currency,
                payment_method=payment_method,
                invoice_id=f"INV-{uuid.uuid4().hex[:8].upper()}",  # Generate unique invoice ID
                status='pending'
            )

            # Initiate payment with IntaSend
            response = service.collect.checkout(
                # phone_number=phone_number,
                email=email,
                amount=500,
                currency=currency,
                comment="Payment for ISP service",
                api_ref=payment.invoice_id,  # Use our invoice ID as reference
                phone_number=phone_number,
                redirect_url="https://mksu.com"  # Replace with your actual redirect URL
            )

            # Update payment record with IntaSend checkout details
            payment.checkout_id = response.get('id')
            payment.payment_url = response.get('url')
            payment.save()

            # Return payment URL and details
            return JsonResponse({
                'status': 'success',
                'payment_url': response.get('url'),
                'checkout_id': response.get('id'),
                'invoice_id': payment.invoice_id
            })

        except Exception as e:

            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)

@csrf_exempt
def intasend_webhook_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            print("IntaSend webhook received:", data)

            # Handle challenge (if IntaSend sends a challenge parameter)
            # if "challenge" in data:
            #     return JsonResponse({"challenge": data["challenge"]})

            # Process payment update
            invoice_id = data.get("api_ref")
            state = data.get("state")

            # If no invoice ID in api_ref, use invoice_id from the webhook
            print('here i am222 ',invoice_id,state)

            if not invoice_id:
                invoice_id = data.get("invoice_id")

            # Try to find our payment record
            try:
                print('here i am ')
                payment = ISPAccountPayment.objects.get(invoice_id=invoice_id)
                print(payment.status,state)

                # Update payment status based on webhook state
                if state == "PENDING":
                    payment.status = "pending"
                elif state == "PROCESSING":
                    payment.status = "processing"
                elif state == "COMPLETED":
                    payment.status = "completed"
                    payment.payment_expiry = timezone.now() + timezone.timedelta(days=30)  # Assuming 1 hour expiry
                elif state == "FAILED":
                    payment.status = "failed"
                    payment.failed_reason = data.get("failed_reason")
                    payment.failed_code = data.get("failed_code")

                # Update additional information
                payment.mpesa_reference = data.get("mpesa_reference")
                payment.save()

                # Process additional business logic based on payment status
                if payment.status == "completed":
                    # Handle successful payment (e.g., activate service, send notification)
                    pass

                return JsonResponse({"status": "received", "payment_updated": True}, status=200)

            except ISPAccountPayment.DoesNotExist:
                return JsonResponse({"status": "received", "payment_updated": False,
                                    "error": "Payment record not found"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)




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
        # Get parameters from request
        load_type = request.POST.get("load_type", "all")
        page = int(request.POST.get("page", 1))
        search = request.POST.get("search", "")
        items_per_page = int(request.POST.get("per_page", 9))  # Allow customizable page size

        # Get user's routers
        user_router = Router.objects.filter(Q(
            isp__user=request.user.id
        ))

        # Apply filters based on tab selection
        if load_type == "active":
            filtered_routers = user_router.filter(active=True)
        elif load_type == "inactive":
            filtered_routers = user_router.filter(active=False)
        else:
            filtered_routers = user_router.all()

        # Apply search filter if provided
        if search:
            filtered_routers = filtered_routers.filter(
                Q(name__icontains=search) |
                Q(ip_address__icontains=search) |
                Q(location__icontains=search)
            )

        # Get counts for all tabs
        all_count = user_router.count()
        active_count = user_router.filter(active=True).count()
        inactive_count = user_router.filter(active=False).count()

        # Order by most recently created first
        ordered_routers = filtered_routers
        # ordered_routers = filtered_routers.order_by('-created_at')

        # Use Django's paginator for cleaner handling
        paginator = Paginator(ordered_routers, items_per_page)
        current_page = paginator.get_page(page)

        # Prepare the list of routers for the response
        routers_list = []
        for router in current_page:
            routers_list.append({
                'id': router.id,
                'name': router.name,
                'ip_address': router.ip_address,
                'location': router.location,
                'active': router.active,
                'identity': router.identity,
                # 'created_at': router.created_at.strftime('%Y-%m-%d %H:%M:%S') if router.created_at else None,
                # 'last_seen': router.last_seen.strftime('%Y-%m-%d %H:%M:%S') if router.last_seen else None,
            })

        # Return response with routers and pagination data
        return JsonResponse({
            'routers': routers_list,
            'all_count': all_count,
            'active_count': active_count,
            'inactive_count': inactive_count,
            'current_page': page,
            'total_pages': paginator.num_pages,
            'has_next': current_page.has_next(),
            'has_previous': current_page.has_previous()
        })

    # Handle GET request or other methods
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def router_create(request):
    if request.method == "POST":
        try:
            data = request.POST
            company = SystemUser.objects.get(user=request.user)
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
                isp=SystemUser.objects.get(user=request.user.id)
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
    ports, wan = transform_ports(intf, network.wan)
    return JsonResponse({'ok': True, "ports": ports, "wan": wan})


@api_view(["GET"])
def check_connection(request, mtk):
    user = request.user
    router_identity = f"{user.username}_{mtk}"
    routerExisting = get_object_or_404(Router, identity=router_identity)
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
        data = json.loads(request.body)
        load_type = data.get("load_type", "all")
        search_term = data.get("search", "")
        page = int(data.get("page", 1))
        page_size = 9  # Items per page

        # Base queryset
        user_pkgs = Package.objects.filter(
            Q(router__isp__user=request.user.id)
        )

        # Filter by type if specified
        if load_type not in ["all"]:
            pkgs = user_pkgs.filter(type=load_type)
        else:
            pkgs = user_pkgs.all()

        # Search functionality
        if search_term:
            pkgs = pkgs.filter(
                Q(name__icontains=search_term) |
                Q(download_speed__icontains=search_term)
                # Q(router_identity__icontains=search_term)
            )

        # Calculate total counts for filters

        all_count = user_pkgs.count()
        h_count = user_pkgs.filter(type="hotspot").count()
        p_count = user_pkgs.filter(type="pppoe").count()

        # Calculate pagination
        start = (page - 1) * page_size
        end = start + page_size
        paginated_pkgs = pkgs[start:end]

        # Convert to list of dictionaries
        pkgs_data = [pkg_to_dict(pkg) for pkg in paginated_pkgs]

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
                res = mikrotik_manager.connect_router(host=router.identity, username=router.username,
                                                      password=router.password)
                # def create_profile(self, name, rate_limit=None, session_timeout=None, service="pppoe"):
                print(res, 'bbbhbhbh')
                result = res.create_profile(name=data['name'], rate_limit=ratelimit, session_timeout=data["duration"],
                                            service="pppoe")
                print(result)
                # res = mikrotik_manager.connect_router(router.identity, router.username, router.password)
                # def create_profile(self, name, rate_limit=None, session_timeout=None, service="pppoe"):
                # print(res, 'bbbhbhbh')
                # res.create_profile(name=data['name'], rate_limit=ratelimit, session_timeout=data.get("duration"),
                #                    service="pppoe")
            except Exception as e:
                return JsonResponse({'error': "Router connection failed"}, status=400)

            pkg = Package.objects.create(
                name=data['name'],
                type=data['type'],
                upload_speed=data['speed'],
                download_speed=data['speed'],
                price=data['price'],
                router=router,
                duration=data['duration']
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


def client_to_dict(client):
    """Convert a Client model instance to a dictionary"""
    return {
        'id': client.id,
        'full_name': client.full_name,
        'phone': client.phone,
        'address': client.address,
        'created_at': client.created_at.isoformat(),
        'due': client.due.isoformat() if client.due else None,
        'package_start': client.package_start.strftime('%Y-%m-%d') if client.package_start else None,
        'router_username': client.router_username,
        'router_password': client.router_password,
        'isp': client.isp_id,
        'package': {
            'id': client.package.id,
            'name': client.package.name,
            'download_speed': client.package.download_speed,
            'upload_speed': client.package.upload_speed,
            'duration': client.package.duration,
            'price': client.package.price,
            'type': client.package.type,
            'created_at': client.package.created_at.isoformat() if client.package.created_at else None,
            'router': {
                'id': client.package.router.id,
                'name': client.package.router.name,
                'username': client.package.router.username,
                'password': client.package.router.password,
                'location': client.package.router.location,
            } if client.package.router else None
        } if client.package else None
    }


@csrf_exempt
def user_list(request):
    if request.method == "POST":
        # Handle both form data and JSON data
        if request.content_type == 'application/json':
            data = json.loads(request.body)
            load_type = data.get("load_type", "all")
            search = data.get("search", "")
            page = data.get("page", 1)
            page_size = data.get("page_size", 10)
        else:
            load_type = request.POST.get("load_type", "all")
            search = request.POST.get("search", "")
            page = int(request.POST.get("page", 1))
            page_size = int(request.POST.get("page_size", 10))

        # Apply filters based on load_type
        if load_type in ["hotspot", "pppoe"]:
            users = Client.objects.filter(
                Q(package__type=load_type)
            )
        else:
            users = Client.objects.all()

        # Apply search filter if provided
        if search:
            users = users.filter(
                Q(full_name__icontains=search) |
                Q(phone__icontains=search) |
                Q(email__icontains=search)
            )

        # Calculate total counts
        all_count = Client.objects.filter(isp=request.user.id).count()
        h_count = Client.objects.filter(
            Q(package__type="hotspot")
        ).count()
        p_count = Client.objects.filter(
            Q(package__type="pppoe")
        ).count()

        # Apply pagination
        start_index = (page - 1) * page_size
        end_index = start_index + page_size

        # Get the paginated results and convert to dict
        paginated_users = users[start_index:end_index]
        users_data = [client_to_dict(user) for user in paginated_users]

        # Check if there are more results
        has_more = users.count() > end_index

        return JsonResponse({
            "users": users_data,
            "all_count": all_count,
            "pppoe_count": p_count,
            "hotspot_count": h_count,
            "has_more": has_more,
            "total_count": users.count()
        }, safe=False)


@csrf_exempt
def delete_client(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            client_id = data.get("id")
            username = data.get("username")

            if not client_id:
                return JsonResponse({"success": False, "message": "Client ID is required"}, status=400)

            client = Client.objects.get(id=client_id)

            # Optional: Perform any additional validation here
            # For example, checking if the username matches the client's username
            if username and client.router_username != username:
                return JsonResponse({"success": False, "message": "Username mismatch"}, status=400)
            router = client.package.router
            # Check if the router is reachable
            if not router:
                return JsonResponse({"success": False, "message": "Router not found"}, status=404)
            try:
                res = mikrotik_manager.connect_router(host=router.identity, username=router.username,
                                                      password=router.password)
                res.remove_client(username=client.router_username, service=client.package.type)

            except Exception as e:

                print(str(e))
                return JsonResponse({'error': "MikroTik connection failed"}, status=400)
            client.delete()
            return JsonResponse({"success": True, "message": "Client deleted successfully"})

        except Client.DoesNotExist:
            return JsonResponse({"success": False, "message": "Client not found"}, status=404)
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=500)

    return JsonResponse({"success": False, "message": "Method not allowed"}, status=405)


@csrf_exempt
def user_create(request):
    if request.method == "POST":
        bodyData = json.loads(request.body)
        data = bodyData.copy()
        try:
            required_fields = ['fullName', 'phone', 'packageId']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return JsonResponse({'error': f"Missing fields: {', '.join(missing_fields)}"}, status=400)
            package = Package.objects.get(id=data['packageId'])
            router = package.router
            data['password'] = generate_password(data['fullName'])
            data['username'] = generate_password(data['fullName'])
        except Package.DoesNotExist:
            return JsonResponse({'error': 'Package not found'}, status=400)
        except Router.DoesNotExist:
            return JsonResponse({'error': 'Router not found'}, status=400)
        if Client.objects.filter(router_username=router.name, package=package, phone=data["phone"]).exists():
            return JsonResponse(
                {'error': f"Client: {data['fullName']} already in use for router {router.name}"},
                status=400
            )

        try:
            res = mikrotik_manager.connect_router(host=router.identity, username=router.username,
                                                  password=router.password)

            res.add_client(username=data['username'], password=data['password'], profile_name=package.name,
                           service=package.type)
        except Exception as e:

            print(str(e))
            return JsonResponse({'error': "MikroTik connection failed"}, status=400)

        try:
            with transaction.atomic():
                client = Client.objects.create(
                    phone=data['phone'],
                    full_name=data['fullName'],
                    isp=request.user,
                    package=package,
                    router_username=data['username'],
                    router_password=data['password'],
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
                client = client_to_dict(client)
                return JsonResponse({'success': "User created successfully", "client": client}, status=201)

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
        company = SystemUser.objects.filter(user=request.user.id).first()
        return JsonResponse({'company': company_to_dict(company)})

    def post(self, request):
        data = request.POST
        print(data)
        try:
            c = SystemUser.objects.get(user=request.user)
            if not c:
                c = SystemUser.objects.create(user=request.user,
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
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)


@api_view(["GET", "POST"])
def hotspot_packages(request):
    ip=request.POST.get("ip")
    routerId=request.get("router")


    return render(request, "hotspot/packages.html")


@api_view(["GET"])
def et(request):
    import m2
    # from sendgrid import SendGridAPIClient
    # from sendgrid.helpers.mail import Mail
    #
    # message = Mail(
    #     from_email='info@lomtechnology.com',
    #     to_emails='abutimartin778@gmail.com',
    #     subject='Sending with Twilio SendGrid is Fun',
    #     html_content='<strong>and easy to do anywhere, even with Python</strong>')
    # try:
    #     sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
    #     response = sg.send(message)
    #     print(response.status_code)
    #     print(response.body)
    #     print(response.headers)
    # except Exception as e:
    #     print(e)
    return JsonResponse({})
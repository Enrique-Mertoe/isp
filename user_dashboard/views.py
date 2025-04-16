from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse_lazy
from django.views import View
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.generic import ListView, CreateView, DetailView, UpdateView, DeleteView

from user_dashboard.forms import RouterForm, CompanyForm
from user_dashboard.helpers import router_to_dict, pkg_to_dict, user_to_dict, company_to_dict, client_to_dict
from user_dashboard.models import Router, Package, User, ISPProvider, Client
import routeros_api as r_os


# Create your views here.
@login_required
def home(request):
    return render(request, 'index.html')


@ensure_csrf_cookie
def set_csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})


def start_app(request):
    if request.method == "POST":
        users = Client.objects.filter(isp=request.user.id).count()
        pakgs = Package.objects.filter(Q(
            router__isp__user=request.user.id
        )).count()
        routers = Router.objects.filter(isp=request.user.id).count()
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


# packages views

def pkg_page(request):
    return render(request, 'index.html')


def pkg_list(request):
    if request.method == "POST":
        load_type = request.POST.get("load_type", "all")
        # search = request.data.get("search", "")
        #
        # if search:
        #     routers = routers.filter(
        #         Q(name__icontains=search) | Q(ip_address__icontains=search)
        #     )
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


@csrf_exempt
def pkg_create(request):
    if request.method == "POST":
        try:
            data = request.POST
            router = Router.objects.get(id=data.get('router'))
            if not router:
                return JsonResponse({'error': "Unrecognised router."}, status=400)
            conn = r_os.RouterOsApiPool(host='192.168.88.1',
                                        password='12345_-',
                                        username='admin',
                                        plaintext_login=True)
            try:
                api = conn.get_api()
                api.get_resource("ppp/profile").add(name=data.get('name'))
                conn.disconnect()
            except Exception as e:
                return JsonResponse({'error': "Router connection failed"}, status=400)

            pkg = Package.objects.create(
                name=data.get('name'),
                type=data.get('type'),
                upload_speed=data.get('upload_speed'),
                download_speed=data.get('download_speed'),
                price=data.get('price'),
                router=router
            )
            return JsonResponse(pkg_to_dict(pkg), status=201)
        except Exception as e:
            print(e)
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


@csrf_exempt
def pkg_delete(request, pk):
    router = get_object_or_404(Router, pk=pk)
    if request.method == "DELETE":
        router.delete()
        return JsonResponse({'message': 'Router deleted successfully.'})
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
        try:
            data = request.POST
            print(data)
            # user = User.objects.create(
            #     name=data.get('name'),
            #     type=data.get('type'),
            #     upload_speed=data.get('upload_speed'),
            #     download_speed=data.get('download_speed'),
            #     price=data.get('price'),
            #     router=Router.objects.get(id=data.get('router'))
            # )
            # return JsonResponse(user_to_dict(user), status=201)
            return HttpResponseBadRequest()
        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=400)
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

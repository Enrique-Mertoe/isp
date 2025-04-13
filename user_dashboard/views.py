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
from user_dashboard.helpers import router_to_dict, pkg_to_dict, user_to_dict, company_to_dict
from user_dashboard.models import Router, Package, User, Company


# Create your views here.
@login_required
def home(request):
    return HttpResponse("Hello, this is the home page!")


@ensure_csrf_cookie
def set_csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})


def start_app(request):
    if request.method == "POST":
        users = User.objects.all().count()
        pakgs = Package.objects.all().count()
        routers = Router.objects.all().count()
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

        if load_type == "active":
            routers = Router.objects.filter(active=True)
        elif load_type == "inactive":
            routers = Router.objects.filter(active=False)
        else:
            routers = Router.objects.all()

        routers_data = [router_to_dict(router) for router in routers]

        # Always calculate total counts
        all_count = Router.objects.count()
        active_count = Router.objects.filter(active=True).count()
        inactive_count = Router.objects.filter(active=False).count()

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
            print(data)
            router = Router.objects.create(
                name=data.get('name'),
                password=data.get('password'),
                location=data.get('location'),
                username=data.get('username'),
                ip_address=data.get('ip')
            )
            return JsonResponse(router_to_dict(router), status=201)
        except Exception as e:
            print(e)
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

        if load_type in ["hotspot", "pppoe"]:
            routers = Package.objects.filter(type=load_type)
        else:
            routers = Package.objects.all()

        pkgs_data = [pkg_to_dict(router) for router in routers]

        # Always calculate total counts
        all_count = Package.objects.count()
        h_count = Package.objects.filter(type="hotspot").count()
        p_count = Package.objects.filter(type="pppoe").count()

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
            print(data)
            pkg = Package.objects.create(
                name=data.get('name'),
                type=data.get('type'),
                upload_speed=data.get('upload_speed'),
                download_speed=data.get('download_speed'),
                price=data.get('price'),
                router=Router.objects.get(id=data.get('router'))
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
            users = User.objects.filter(
                Q(package__type=load_type)
            )
        else:
            users = User.objects.all()

        users_data = [user_to_dict(user) for user in users]

        # Always calculate total counts
        all_count = User.objects.count()
        h_count = User.objects.filter(
            Q(package__type="hotspot")
        ).count()
        p_count = User.objects.filter(
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
        company, _ = Company.objects.get_or_create(id=1)
        return JsonResponse({'company': company_to_dict(company)})

    def post(self, request):
        try:
            company, _ = Company.objects.get_or_create(id=1)
            form = CompanyForm(request.POST, instance=company)
            if form.is_valid():
                form.save()
                return JsonResponse(company_to_dict(company), status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.shortcuts import render, get_object_or_404
from django.urls import reverse_lazy
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.generic import ListView, CreateView, DetailView, UpdateView, DeleteView

from user_dashboard.forms import RouterForm
from user_dashboard.helpers import router_to_dict
from user_dashboard.models import Router


# Create your views here.
@login_required
def home(request):
    return HttpResponse("Hello, this is the home page!")


@ensure_csrf_cookie
def set_csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})


# Router controller
def router_page(request):
    return render(request, 'index.html')


def router_list(request):
    if request.method == "GET":
        routers = Router.objects.all()
        data = [router_to_dict(router) for router in routers]
        return JsonResponse(data, safe=False)


@csrf_exempt
def router_create(request):
    if request.method == "POST":
        try:
            data = request.POST
            router = Router.objects.create(
                name=data.get('name'),
                password=data.get('password'),
                location=data.get('location'),
                ip_address=data.get('ip_address')
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

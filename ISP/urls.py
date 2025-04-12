"""
URL configuration for ISP project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

from user_dashboard import views
from user_dashboard.views import set_csrf

router_url_patterns = [
    path('routers/page/', views.router_page, name='router_page'),  # Normal page for React app maybe
    path('api/routers/', views.router_list, name='router_list'),  # GET all
    path('api/routers/create/', views.router_create, name='router_create'),  # POST
    path('api/routers/<int:pk>/', views.router_detail, name='router_detail'),  # GET one
    path('api/routers/<int:pk>/update/', views.router_update, name='router_update'),  # PUT/PATCH
    path('api/routers/<int:pk>/delete/', views.router_delete, name='router_delete'),  # DELETE
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='index.html')),
    path('users/', TemplateView.as_view(template_name='index.html')),
    path('mikrotiks/', TemplateView.as_view(template_name='index.html')),
    path('packages/', TemplateView.as_view(template_name='index.html')),
    path('api/csrf/', set_csrf),
    path('auth/', include("user_dashboard.auth.urls")),
    *router_url_patterns

]

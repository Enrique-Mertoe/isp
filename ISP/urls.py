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
from django.urls import path, include, URLResolver, URLPattern
from django.views.generic import TemplateView

from user_dashboard import views, dash_view, mtk_views
from user_dashboard.mtk_views import serve_hotspot_file
from user_dashboard.views import set_csrf

router_url_patterns = [
    path('routers/page/', views.router_page, name='router_page'),  # Normal page for React app maybe
    path('api/routers/', views.router_list, name='router_list'),  # GET all
    path('api/routers/create/', views.router_create, name='router_create'),  # POST
    path('api/routers/provision/', mtk_views.gen_mtk_provision, name='router_provison'),  # POST
    path('provision_content/<encoded_payload>/', mtk_views.provision_content, name='provision_content'),  # POST
    path('provision_content/<encoded_payload>/ovpn/<int:version>/', mtk_views.provision_version_content,
         name='provision_version_content'),  # POST
    path('api/routers/<int:pk>/', views.router_detail, name='router_detail'),  # GET one
    path('api/routers/<int:pk>/update/', views.router_update, name='router_update'),  # PUT/PATCH
    path('api/routers/<int:pk>/delete/', views.router_delete, name='router_delete'),  # DELETE
    path('api/routers/count/', views.router_count, name='router_count'),
    path('api/routers/interface/', views.router_interfaces, name='router_interfaces'),
    path('api/routers/check-connection/<mtk>/', views.check_connection, name='router_conn'),  # DELETE
]

pkg_url_patterns = [
    path('pkgs/page/', views.pkg_page, name='pkg_page'),  # Normal page for React app maybe
    path('api/pkgs/', views.pkg_list, name='pkg_list'),  # GET all
    path('api/pkgs/create/', views.pkg_create, name='pkg_create'),  # POST
    path('api/pkgs/<int:pk>/', views.pkg_detail, name='pkg_detail'),  # GET one
    path('api/pkgs/<int:pk>/update/', views.pkg_update, name='pkg_update'),  # PUT/PATCH
    path('api/pkgs/<int:pk>/delete/', views.pkg_delete, name='pkg_delete'),  # DELETE
]

user_urlpatterns: list[URLResolver | URLPattern] = [
    path('user/page/', views.user_page, name='user_page'),  # Normal page for React app maybe
    path('api/user/', views.user_list, name='user_list'),  # GET all
    path('api/user/create/', views.user_create, name='user_create'),  # POST
    path('api/user/<int:pk>/', views.user_detail, name='user_detail'),  # GET one
    path('api/user/<int:pk>/update/', views.user_update, name='user_update'),  # PUT/PATCH
    path('api/user/<int:pk>/delete/', views.user_delete, name='user_delete'),  # DELETE
]
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home),
    path('users/', TemplateView.as_view(template_name='index.html')),
    path('mikrotiks/', TemplateView.as_view(template_name='index.html')),
    path('mikrotiks/<int:pk>/', views.MTKView.as_view(), name='mtk-view'),
    path('packages/', TemplateView.as_view(template_name='index.html')),
    path('api/csrf/', set_csrf),
    path('auth/', include("user_dashboard.auth.urls")),
    *router_url_patterns,
    *pkg_url_patterns,
    *user_urlpatterns,
    path("api/start-up/", views.start_app, name="start-up"),
    path("api/dash/", dash_view.dashboard_view, name="dash-view-api"),
    path('isp/', views.CompanyEditView.as_view(), name='company_edit'),

    # Add these new patterns
    path('mikrotik/hotspot/<str:router_identity>/<str:file_name>', serve_hotspot_file, name='hotspot_file'),
    path("hotspot/", include("user_dashboard.urls"))

]

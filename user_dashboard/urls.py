from django.urls import path

from user_dashboard.views import hotspot_packages

urlpatterns = [
    path("packages/", hotspot_packages, name="hotspot_packages")
]

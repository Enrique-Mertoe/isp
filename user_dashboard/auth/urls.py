from django.urls import path
from user_dashboard.auth.auth_views import LoginView, PasswordResetCustomView, logout_view

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
    path('password-reset/', PasswordResetCustomView.as_view(), name='password_reset'),
]

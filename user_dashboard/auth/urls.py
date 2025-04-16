from django.urls import path
import user_dashboard.auth.auth_views as v

urlpatterns = [
    path('login/', v.LoginView.as_view(), name='login'),
    path('logout/', v.logout_view, name='logout'),
    path('validate/', v.validate, name='logout'),
    path('register/', v.RegisterView.as_view(), name='register'),
    path('password-reset/', v.PasswordResetCustomView.as_view(), name='password_reset'),
]

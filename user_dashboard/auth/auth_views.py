# app/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.views import PasswordResetView as DjangoPasswordResetView, LoginView
from django.http import JsonResponse
from django.views import View
from .forms import LoginForm, PasswordResetForm


class AjaxFormMixin(LoginView):
    def form_invalid(self, form):
        if self.request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'errors': form.errors}, status=400)
        return super().form_invalid(form)

    def form_valid(self, form):
        if self.request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'redirect_url': self.get_success_url()})
        return super().form_valid(form)


class LoginView(View):
    template_name = 'index.html'
    form_class = LoginForm

    def get(self, request):
        return render(request, self.template_name, {'form': self.form_class()})

    def post(self, request):
        form = self.form_class(request.POST)
        if form.is_valid():
            user = form.cleaned_data['user']
            login(request, user)
            return JsonResponse({'ok': True})
        else:
            errors = []
            for field_errors in form.errors.values():
                errors.extend(field_errors)
            return JsonResponse({'ok': False, 'error': errors})


class PasswordResetCustomView(AjaxFormMixin, DjangoPasswordResetView):
    template_name = 'index.html'
    form_class = PasswordResetForm
    email_template_name = 'auth/password_reset_email.html'
    success_url = '/auth/password-reset-done/'


def logout_view(request):
    logout(request)
    return redirect('/auth/login/')

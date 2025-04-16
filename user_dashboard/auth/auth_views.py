# app/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.views import PasswordResetView as DjangoPasswordResetView, LoginView
from django.http import JsonResponse, HttpResponseBadRequest
from django.views import View
from .forms import LoginForm, PasswordResetForm
from ..models import User, ISPProvider, Detail


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


class RegisterView(View):
    template_name = 'index.html'

    def get(self, request):
        return render(request, self.template_name)

    def post(self, request):
        data = request.POST
        email = data['email']
        password = data['password']
        user = User.objects.create_user(email=email,
                                        username=data['fname'] + '_' + data['lname'],
                                        password=password)
        user.role = 'isp'
        user.save()
        ISPProvider.objects.create(
            name=data['fname'] + ' ' + data['fname'],
            phone=data['phone'],
            email=email,
            user=user
        )

        Detail.objects.create(
            user=user,
            first_name=data['fname'],
            last_name=data['lname'],
            phone=data['phone'],
        )
        # user = User.objects.create_user(
        #     email=data['email'],
        #     password=data['password'],
        #     first_name=data['fname'],
        #     last_name=data['lname'],
        #     phone=data['fname'],
        #     username=data['fname'] + '_' + data['lname']
        # )
        login(request, user)
        return JsonResponse({'ok': True})

    # else:
    # errors = []
    # for field_errors in form.errors.values():
    #     errors.extend(field_errors)
    # return JsonResponse({'ok': False, 'error': errors})


class PasswordResetCustomView(AjaxFormMixin, DjangoPasswordResetView):
    template_name = 'index.html'
    form_class = PasswordResetForm
    email_template_name = 'auth/password_reset_email.html'
    success_url = '/auth/password-reset-done/'


def logout_view(request):
    logout(request)
    return redirect('/auth/login/')


def validate(request):
    email = request.POST.get('email')
    if request.method == 'POST' and email:
        user = User.objects.filter(email=email).first()
        if user:
            return JsonResponse({
                "ok": False,
                'error': ['Email exists. Try another one']
            }, status=200)
        return JsonResponse({
            "ok": True,
        })
    return HttpResponseBadRequest()

from django import forms
from django.contrib.auth.forms import PasswordResetForm as DjangoPasswordResetForm
from django.contrib.auth import authenticate

from user_dashboard.models import User


class LoginForm(forms.Form):
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        password = cleaned_data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise forms.ValidationError("Invalid email or password")

        user = authenticate(username=user.username, password=password)
        if user is None:
            raise forms.ValidationError("Invalid email or password")

        cleaned_data['user'] = user
        return cleaned_data


class PasswordResetForm(DjangoPasswordResetForm):
    pass  # use Django's secure password reset form


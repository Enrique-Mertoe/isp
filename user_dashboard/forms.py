from django import forms

from user_dashboard.models import Router


class RouterForm(forms.ModelForm):
    class Meta:
        model = Router
        fields = ['name', 'password', 'location', 'ip_address']

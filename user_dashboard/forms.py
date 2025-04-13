from django import forms

from user_dashboard.models import Router, Company


class RouterForm(forms.ModelForm):
    class Meta:
        model = Router
        fields = ['name', 'password', 'location', 'ip_address']


class CompanyForm(forms.ModelForm):
    class Meta:
        model = Company
        fields = ['name', 'address', 'phone', 'email']

    def clean_name(self):
        name = self.cleaned_data.get('name')
        if not isinstance(name, str) or not name.strip():
            raise forms.ValidationError("Name is required.")
        return name

    def clean_address(self):
        address = self.cleaned_data.get('address')
        if not isinstance(address, str) or not address.strip():
            raise forms.ValidationError("Address is required.")
        return address

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        if not isinstance(phone, str) or not phone.strip():
            raise forms.ValidationError("Phone is required.")
        return phone

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if not isinstance(email, str) or not email.strip():
            raise forms.ValidationError("Email is required.")
        return email

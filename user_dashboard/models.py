import random

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='user')

    def is_admin(self):
        return self.role == 'admin'

    def is_user(self):
        return self.role == 'user'

    def due_amount(self):
        bill = Billing.objects.filter(user=self).aggregate(models.Sum('package_price'))['package_price__sum'] or 0
        pay = Payment.objects.filter(user=self).aggregate(models.Sum('package_price'))['package_price__sum'] or 0
        return bill - pay


class Detail(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='detail')
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    dob = models.DateField(null=True, blank=True)
    pin = models.CharField(max_length=20)
    router_password = models.CharField(max_length=255)
    package_name = models.CharField(max_length=255)
    package_price = models.DecimalField(max_digits=10, decimal_places=2)
    package_start = models.DateField(null=True, blank=True)
    due = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50)
    router_name = models.CharField(max_length=255)


class Billing(models.Model):
    invoice = models.CharField(max_length=20, unique=True)
    package_name = models.CharField(max_length=255)
    package_price = models.DecimalField(max_digits=10, decimal_places=2)
    package_start = models.DateField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='billings')

    def generate_random_number(self):
        while True:
            number = random.randint(100000, 999999)
            if not Billing.objects.filter(invoice=number).exists():
                return number


class Payment(models.Model):
    billing = models.ForeignKey(Billing, on_delete=models.CASCADE, related_name='payments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    invoice = models.CharField(max_length=20)
    payment_method = models.CharField(max_length=100)
    package_price = models.DecimalField(max_digits=10, decimal_places=2)


class Ticket(models.Model):
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('closed', 'Closed'),
        ('pending', 'Pending'),
    )
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )

    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    number = models.CharField(max_length=20, unique=True)

    def generate_random_number(self):
        while True:
            number = random.randint(100000, 999999)
            if not Ticket.objects.filter(number=number).exists():
                return number


class Router(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField()
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Package(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    router = models.ForeignKey(Router, related_name='packages', on_delete=models.CASCADE)

    def __str__(self):
        return self.name

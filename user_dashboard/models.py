import datetime
import random
from routeros_api import RouterOsApiPool
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from routeros_api.api import RouterOsApi


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
        ('isp', 'ISP'),
    )
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='user')
    isp = models.ForeignKey('ISPProvider', null=True, blank=True, on_delete=models.SET_NULL,
                                     related_name='users')
    # package = models.ForeignKey(Package, related_name='users', on_delete=models.CASCADE)

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
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)


class ISPProvider(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=50)
    email = models.EmailField()
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='isp_account')


class Router(models.Model):
    name = models.CharField(max_length=255)
    identity = models.CharField(max_length=255)
    secrete = models.CharField(max_length=255)
    location = models.CharField(max_length=255,null=True)
    ip_address = models.GenericIPAddressField()
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    active = models.BooleanField(default=False)
    isp = models.ForeignKey(ISPProvider, related_name='routers', on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    def connection(self) -> RouterOsApi | None:
        try:
            res = RouterOsApiPool(
                host=self.ip_address, username=self.username,
                password=self.password, plaintext_login=True
            )
            return res.get_api()
        except Exception as e:
            return None


class Billing(models.Model):
    invoice = models.CharField(max_length=20, unique=True)
    package_name = models.CharField(max_length=255)
    package_price = models.DecimalField(max_digits=10, decimal_places=2)
    package_start = models.DateField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='billings')
    created_at = models.DateTimeField(default=timezone.now)

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
    created_at = models.DateTimeField(default=timezone.now)


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
    created_at = models.DateTimeField(default=timezone.now)

    def generate_random_number(self):
        while True:
            number = random.randint(100000, 999999)
            if not Ticket.objects.filter(number=number).exists():
                return number


class Package(models.Model):
    PACKAGE_CHOICES = (
        ('hotspot', 'Hotspot'),
        ('pppoe', 'PPPoE'),
        ('data_plan', 'Data Plan'),
    )
    name = models.CharField(max_length=255)
    price = models.CharField(max_length=255)
    upload_speed = models.CharField(max_length=255, default="No limit")
    download_speed = models.CharField(max_length=255, default="No limit")
    type = models.CharField(max_length=20, choices=PACKAGE_CHOICES, default="hotspot", null=False)
    router = models.ForeignKey(Router, related_name='packages', on_delete=models.CASCADE)
    duration=models.CharField(max_length=100,default="30 days")
    created_at=models.DateTimeField(default=timezone.now)


    def __str__(self):
        return self.name


class Client(models.Model):
    package = models.ForeignKey(Package, related_name='packages', on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    isp = models.ForeignKey(User, related_name='ispAccount', on_delete=models.CASCADE)
    package_start = models.DateField(null=True, blank=True)
    router_password = models.CharField(max_length=255)
    router_username = models.CharField(max_length=255)
    due = models.DateTimeField()
    created_at = models.DateTimeField(default=timezone.now)


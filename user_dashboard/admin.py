from django.contrib import admin
from .models import Router, Package, User, Detail, Billing, Payment, Ticket

class RouterAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'ip_address', 'active')
    search_fields = ('name', 'location', 'ip_address')
    list_filter = ('active',)

class PackageAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'type', 'router', 'upload_speed', 'download_speed')
    search_fields = ('name', 'type')
    list_filter = ('type', 'router')

class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    list_filter = ('role', 'is_active')

class DetailAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'first_name', 'last_name')
    search_fields = ('user__username', 'phone', 'first_name', 'last_name')
    list_filter = ()

class BillingAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'user', 'package_name', 'package_price', 'package_start', 'created_at')
    search_fields = ('invoice', 'user__username', 'package_name')
    list_filter = ('created_at',)

class PaymentAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'user', 'payment_method', 'package_price', 'created_at')
    search_fields = ('invoice', 'user__username')
    list_filter = ('payment_method', 'created_at')

class TicketAdmin(admin.ModelAdmin):
    list_display = ('number', 'subject', 'user', 'status', 'priority')
    search_fields = ('number', 'subject', 'user__username')
    list_filter = ('status', 'priority')

admin.site.register(Router, RouterAdmin)
admin.site.register(Package, PackageAdmin)
admin.site.register(User, UserAdmin)
admin.site.register(Detail, DetailAdmin)
admin.site.register(Billing, BillingAdmin)
admin.site.register(Payment, PaymentAdmin)
admin.site.register(Ticket, TicketAdmin)
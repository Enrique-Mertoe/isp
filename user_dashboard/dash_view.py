from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.db.models import Sum, Count
from django.utils.timezone import now
from calendar import monthrange

from .helpers import user_to_dict, payment_to_dict, ticket_to_dict
from .models import User, Package, Billing, Payment, Ticket, Detail
from collections import defaultdict
import datetime


def dashboard_view(request):
    if request.method != "POST":
        return HttpResponseBadRequest()
    current_month = now().month
    current_year = now().year
    days_in_month = monthrange(current_year, current_month)[1]

    # Totals
    total_packages = Package.objects.count()
    total_bills = Billing.objects.aggregate(total=Sum('package_price'))['total'] or 0
    total_payments = Payment.objects.aggregate(total=Sum('package_price'))['total'] or 0
    total_users = User.objects.filter(role='user').count()
    open_tickets = Ticket.objects.filter(status='open').count()

    # Recent
    recent_users = User.objects.filter(role='user').select_related('detail').prefetch_related('billings').order_by(
        '-id')[:5]
    recent_payments = Payment.objects.select_related('user').order_by('-id')[:5]
    recent_tickets = Ticket.objects.order_by('-id')[:5]

    # Monthly & Yearly
    payments_this_month = Payment.objects.filter(created_at__month=current_month).aggregate(total=Sum('package_price'))[
                              'total'] or 0
    bills_this_month = Billing.objects.filter(created_at__month=current_month).aggregate(total=Sum('package_price'))[
                           'total'] or 0
    payments_this_year = Payment.objects.filter(created_at__year=current_year).aggregate(total=Sum('package_price'))[
                             'total'] or 0
    bills_this_year = Billing.objects.filter(created_at__year=current_year).aggregate(total=Sum('package_price'))[
                          'total'] or 0

    # Users with dues
    users_with_due = [user for user in User.objects.filter(role='user').select_related('detail') if
                      user.due_amount() > 0]
    users_with_due_count = len(users_with_due)

    # Monthly aggregation by month name
    billing_data = defaultdict(float)
    payment_data = defaultdict(float)

    for b in Billing.objects.filter(created_at__year=current_year):
        billing_data[b.created_at.strftime('%B')] += b.package_price

    for p in Payment.objects.filter(created_at__year=current_year):
        payment_data[p.created_at.strftime('%B')] += p.package_price

    # Daily aggregation for current month
    daily_billing_data = []
    daily_payment_data = []

    for day in range(1, days_in_month + 1):
        date = datetime.date(current_year, current_month, day)
        # daily_billing = Billing.objects.filter(created_at__date=date).aggregate(total=Sum('package_price'))[
        #                     'total'] or 0
        daily_billing = Billing.objects.filter(created_at__date=date.today()).aggregate(total=Sum('package_price'))[
                            'total'] or 0
        daily_payment = Payment.objects.filter(created_at__date=date.today()).aggregate(total=Sum('package_price'))[
                            'total'] or 0
        daily_billing_data.append(daily_billing)
        daily_payment_data.append(daily_payment)
    print({
        'total_packages': total_packages,
        'total_bills': total_bills,
        'total_payments': total_payments,
        'total_users': total_users,
        'open_tickets': open_tickets,
        'recent_users': recent_users,
        'recent_payments': [payment_to_dict(pmt) for pmt in recent_payments],
        'recent_tickets': [ticket_to_dict(tkt) for tkt in recent_tickets],
        'payments_this_month': payments_this_month,
        'bills_this_month': bills_this_month,
        'payments_this_year': payments_this_year,
        'bills_this_year': bills_this_year,
        'users_with_due_count': users_with_due_count,
        'users_with_due_list': users_with_due,
        'billing_data': dict(billing_data),
        'payment_data': dict(payment_data),
        'daily_billing_data': daily_billing_data,
        'daily_payment_data': daily_payment_data,
    })
    return JsonResponse({
        'total_packages': total_packages,
        'total_bills': total_bills,
        'total_payments': total_payments,
        'total_users': total_users,
        'open_tickets': open_tickets,
        'recentUsers': [user_to_dict(user) for user in recent_users],
        'recentPayments': [payment_to_dict(pmt) for pmt in recent_payments],
        'recent_tickets': [ticket_to_dict(tkt) for tkt in recent_tickets],
        'payments_this_month': payments_this_month,
        'bills_this_month': bills_this_month,
        'payments_this_year': payments_this_year,
        'billsThisYear': bills_this_year,
        'users_with_due_count': users_with_due_count,
        'usersWithDueList': users_with_due,
        'billingData': dict(billing_data),
        'paymentData': dict(payment_data),
        'dailyBillingData': daily_billing_data,
        'dailyPaymentData': daily_payment_data,
    }, safe=False)

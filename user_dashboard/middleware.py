from django.shortcuts import redirect
from django.utils.http import urlencode
from user_dashboard.models import ISPAccountPayment
from django.utils import timezone

from user_dashboard.account import Account

EXCLUDED_PATHS = [
    '/static/',  # static files
    '/media/',
    '/api/csrf/',
    '/accountpay/',

]

AUTH_PATHS = [
    '/auth/'
]


class LoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path
        Account.init(request)
        print(path)

    #
    #     # Skip static/media/api or public paths
        if (path in EXCLUDED_PATHS):
            return self.get_response(request)
        # if request.user.is_authenticated and path.startswith('/accountpay/'):
        #         latest_payment = (
        #             ISPAccountPayment.objects
        #             .filter(user=request.user.isp, status='completed',payment_expiry__isnull=False, payment_expiry__gt=timezone.now())
        #             .order_by('-payment_expiry')
        #             .first()
        #         )
        #         if not latest_payment:
        #             return redirect('/accountpay/')  # force payment if expired or not completed
        return self.get_response(request)

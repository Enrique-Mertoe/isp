from django.shortcuts import redirect
from django.utils.http import urlencode

EXCLUDED_PATHS = [
    '/static/',  # static files
    '/media/',
    '/api/csrf/'
]

AUTH_PATHS = [
    '/auth/login/',
    '/auth/register/',
    '/auth/forgot-password/',
]


class LoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path

        # Skip static/media/api or public paths
        if any(path.startswith(p) for p in EXCLUDED_PATHS):
            return self.get_response(request)
        # Redirect if user is NOT authenticated
        if request.method == "GET" and not request.user.is_authenticated and not any(
                path.startswith(p) for p in AUTH_PATHS):
            next_url = request.get_full_path()
            login_url = '/auth/login/'
            query_string = urlencode({'next': next_url})
            return redirect(f'{login_url}?{query_string}')

        # Redirect logged-in users away from auth pages
        if request.user.is_authenticated and any(path.startswith(p) for p in AUTH_PATHS):
            return redirect('/')  # or dashboard/homepage

        return self.get_response(request)

from user_dashboard.models import User


class Account:
    user: "User" = None
    inst: "Account" = None

    def __init__(self, req):
        self.req = req

    @classmethod
    def init(cls, request):
        cls.inst = Account(request)
        cls.user = request.user

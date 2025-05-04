from typing import List

from django.shortcuts import render
from django.urls import path
from rest_framework.decorators import api_view

from user_dashboard.account import Account
from user_dashboard.helpers import make_response
from user_dashboard.models import SystemUser


class Team:
    request = None

    @classmethod
    def handler(cls, request):
        cls.request = request
        data = dict(request.POST)
        if not data:
            return make_response(error="No data found!")
        action = data.get("action")
        if not action:
            return make_response(error="Invalid action")
        try:
            return getattr(Team, action)(data.get("data"))
        except Exception as e:
            return make_response(error=f"Something went wrong {e}")

    @classmethod
    def members(cls, data):
        user = Account.user
        if not user:
            return make_response(error="Invalid request")
        return [cls.map(u) for u in SystemUser.objects.filter(user=user).all()]

    @classmethod
    def map(cls, user: SystemUser):
        return {
            "id": user.id,
            "performance": user.performance,
            "role": user.role,
            "email": user.user.email,
            "name": user.user.username,
        }


@api_view(["POST"])
def team(request):
    return render(request, "index.html")


@api_view(["POST"])
def team_requests(request):
    return Team.handler(request)


urlpatterns = [
    path("team/", team, name="team"),
    path("api/team/", team_requests, name="team_request"),
]

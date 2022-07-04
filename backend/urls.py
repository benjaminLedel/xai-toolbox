"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from backend import views

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('api', views.index, name='index'),
    path('api/admin/', admin.site.urls),
    path('api/me/', views.me, name="me"),
    path('api/issue/random', views.randomIssueWithoutLabeling, name='random'),
    path('api/issue/randomSet', views.randomIssueWithoutLabelingSet, name='randomSet'),
    path('api/issue/random/lime', views.randomIssueLIME, name='randomLime'),
    path('api/issue/random/shap', views.randomIssueSHAP, name='randomShap'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/rating/create', views.create_rating, name='create_rating'),
]

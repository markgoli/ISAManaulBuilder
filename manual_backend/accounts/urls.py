from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    ProfileView,
    ChangePasswordView,
    CSRFView,
)


urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('csrf/', CSRFView.as_view(), name='auth-csrf'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('profile/', ProfileView.as_view(), name='auth-profile'),
    path('password/change/', ChangePasswordView.as_view(), name='auth-password-change'),
]



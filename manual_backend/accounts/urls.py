from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    ProfileView,
    ChangePasswordView,
    CSRFView,
    UserManagementViewSet,
    FirstLoginView,
    extend_session,
)

router = DefaultRouter()
router.register(r'users', UserManagementViewSet)


urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('csrf/', CSRFView.as_view(), name='auth-csrf'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('profile/', ProfileView.as_view(), name='auth-profile'),
    path('password/change/', ChangePasswordView.as_view(), name='auth-password-change'),
    path('first-login/', FirstLoginView.as_view(), name='auth-first-login'),
    path('extend-session/', extend_session, name='auth-extend-session'),
    path('', include(router.urls)),
]



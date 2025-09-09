
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views import (
    CategoryViewSet,
    TagViewSet,
    ManualViewSet,
    ManualVersionViewSet,
    ContentBlockViewSet,
    ReviewRequestViewSet,
    AuditLogViewSet,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'tags', TagViewSet)
router.register(r'manuals', ManualViewSet)
router.register(r'versions', ManualVersionViewSet)
router.register(r'blocks', ContentBlockViewSet)
router.register(r'reviews', ReviewRequestViewSet)
router.register(r'audit', AuditLogViewSet, basename='audit')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('accounts.urls')),
]
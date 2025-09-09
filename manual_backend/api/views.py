from django.utils import timezone
from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Category,
    Tag,
    Manual,
    ManualVersion,
    ContentBlock,
    ReviewRequest,
    AuditLog,
)
from .serializers import (
    CategorySerializer,
    TagSerializer,
    ManualSerializer,
    ManualVersionSerializer,
    ContentBlockSerializer,
    ReviewRequestSerializer,
    AuditLogSerializer,
)


class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if hasattr(obj, "created_by"):
            return obj.created_by == request.user or request.user.is_staff
        return request.user.is_staff


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]


class ManualViewSet(viewsets.ModelViewSet):
    queryset = Manual.objects.select_related("category", "current_version", "created_by").prefetch_related("tags")
    serializer_class = ManualSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        manual = serializer.instance
        version = ManualVersion.objects.create(
            manual=manual,
            version_number=1,
            created_by=self.request.user,
        )
        manual.current_version = version
        manual.save(update_fields=["current_version"])
        AuditLog.objects.create(manual=manual, version=version, action=AuditLog.Action.CREATE, actor=self.request.user)

    @action(detail=True, methods=["post"], url_path="submit")
    def submit_for_review(self, request, pk=None):
        manual = self.get_object()
        if manual.status not in [Manual.ManualStatus.DRAFT, Manual.ManualStatus.REJECTED]:
            return Response({"detail": "Manual not in a submittable state."}, status=status.HTTP_400_BAD_REQUEST)
        manual.status = Manual.ManualStatus.SUBMITTED
        manual.save(update_fields=["status"])
        review = ReviewRequest.objects.create(
            version=manual.current_version,
            submitted_by=request.user,
        )
        AuditLog.objects.create(manual=manual, version=manual.current_version, action=AuditLog.Action.SUBMIT, actor=request.user)
        return Response(ReviewRequestSerializer(review).data)

    @action(detail=True, methods=["post"], url_path="publish")
    def publish(self, request, pk=None):
        manual = self.get_object()
        if manual.status != Manual.ManualStatus.APPROVED:
            return Response({"detail": "Manual must be approved before publishing."}, status=status.HTTP_400_BAD_REQUEST)
        version = manual.current_version
        version.is_published = True
        version.published_html = version.published_html or ""
        version.save(update_fields=["is_published", "published_html"])
        manual.status = Manual.ManualStatus.PUBLISHED
        manual.save(update_fields=["status"])
        AuditLog.objects.create(manual=manual, version=version, action=AuditLog.Action.PUBLISH, actor=request.user)
        return Response(ManualSerializer(manual).data)

    @action(detail=True, methods=["post"], url_path="rollback")
    def rollback(self, request, pk=None):
        manual = self.get_object()
        version_number = int(request.data.get("version_number", 0))
        try:
            version = manual.versions.get(version_number=version_number)
        except ManualVersion.DoesNotExist:
            return Response({"detail": "Version not found."}, status=status.HTTP_404_NOT_FOUND)
        manual.current_version = version
        manual.status = Manual.ManualStatus.DRAFT
        manual.save(update_fields=["current_version", "status"])
        AuditLog.objects.create(manual=manual, version=version, action=AuditLog.Action.ROLLBACK, actor=request.user)
        return Response(ManualSerializer(manual).data)


class ManualVersionViewSet(viewsets.ModelViewSet):
    queryset = ManualVersion.objects.select_related("manual", "created_by").prefetch_related("blocks")
    serializer_class = ManualVersionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]

    def perform_create(self, serializer):
        manual = serializer.validated_data["manual"]
        next_version = (manual.versions.aggregate(models.Max("version_number")).get("version_number__max") or 0) + 1
        instance = serializer.save(created_by=self.request.user, version_number=next_version)
        manual.current_version = instance
        manual.status = Manual.ManualStatus.DRAFT
        manual.save(update_fields=["current_version", "status"])
        AuditLog.objects.create(manual=manual, version=instance, action=AuditLog.Action.UPDATE, actor=self.request.user)

    @action(detail=True, methods=["get"], url_path="preview")
    def preview(self, request, pk=None):
        version = self.get_object()
        return Response(ManualVersionSerializer(version).data)


class ContentBlockViewSet(viewsets.ModelViewSet):
    queryset = ContentBlock.objects.select_related("version")
    serializer_class = ContentBlockSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReviewRequestViewSet(viewsets.ModelViewSet):
    queryset = ReviewRequest.objects.select_related("version", "submitted_by", "reviewer")
    serializer_class = ReviewRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        review = self.get_object()
        if review.status != ReviewRequest.ReviewStatus.PENDING:
            return Response({"detail": "Review is not pending."}, status=status.HTTP_400_BAD_REQUEST)
        review.status = ReviewRequest.ReviewStatus.APPROVED
        review.reviewer = request.user
        review.decided_at = timezone.now()
        review.save(update_fields=["status", "reviewer", "decided_at"])
        manual = review.version.manual
        manual.status = Manual.ManualStatus.APPROVED
        manual.save(update_fields=["status"])
        AuditLog.objects.create(manual=manual, version=review.version, action=AuditLog.Action.APPROVE, actor=request.user)
        return Response(ReviewRequestSerializer(review).data)

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        review = self.get_object()
        if review.status != ReviewRequest.ReviewStatus.PENDING:
            return Response({"detail": "Review is not pending."}, status=status.HTTP_400_BAD_REQUEST)
        feedback = request.data.get("feedback", "")
        review.status = ReviewRequest.ReviewStatus.REJECTED
        review.reviewer = request.user
        review.feedback = feedback
        review.decided_at = timezone.now()
        review.save(update_fields=["status", "reviewer", "feedback", "decided_at"])
        manual = review.version.manual
        manual.status = Manual.ManualStatus.REJECTED
        manual.save(update_fields=["status"])
        AuditLog.objects.create(manual=manual, version=review.version, action=AuditLog.Action.REJECT, actor=request.user)
        return Response(ReviewRequestSerializer(review).data)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("manual", "version", "actor")
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

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
    ManualCollaborator,
    ContentBlock,
    ReviewRequest,
    AuditLog,
)
from .serializers import (
    CategorySerializer,
    TagSerializer,
    ManualSerializer,
    ManualVersionSerializer,
    ManualCollaboratorSerializer,
    ContentBlockSerializer,
    ReviewRequestSerializer,
    AuditLogSerializer,
)


class IsAuthorOrCollaboratorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For Manual objects, check if user can edit
        if hasattr(obj, 'can_edit'):
            return obj.can_edit(request.user) or request.user.is_staff
        
        # For other objects, check if user is the creator
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
    queryset = Manual.objects.select_related("category", "current_version", "created_by").prefetch_related("tags", "collaborators__user")
    serializer_class = ManualSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrCollaboratorOrReadOnly]
    lookup_field = 'slug'  # Use slug instead of ID for URL lookups
    
    def get_queryset(self):
        """
        Filter manuals to show only:
        1. APPROVED manuals (visible to everyone)
        2. User's own manuals (any status)
        3. Manuals where user is a collaborator (any status)
        """
        user = self.request.user
        if not user.is_authenticated:
            return Manual.objects.none()
        
        # Base queryset with optimizations
        queryset = Manual.objects.select_related("category", "current_version", "created_by").prefetch_related("tags", "collaborators__user")
        
        # Filter conditions:
        # 1. APPROVED manuals (public)
        # 2. User's own manuals (any status)
        # 3. Manuals where user is a collaborator (any status)
        from django.db.models import Q
        
        return queryset.filter(
            Q(status=Manual.ManualStatus.APPROVED) |  # Public approved manuals
            Q(created_by=user) |  # User's own manuals
            Q(collaborators__user=user)  # Manuals where user is collaborator
        ).distinct()

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
    def submit_for_review(self, request, slug=None):
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


    @action(detail=True, methods=["post"], url_path="rollback")
    def rollback(self, request, slug=None):
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

    @action(detail=True, methods=["post"], url_path="add-collaborator")
    def add_collaborator(self, request, slug=None):
        manual = self.get_object()
        
        # Only creator can add collaborators
        if manual.created_by != request.user:
            return Response({"detail": "Only the manual creator can add collaborators."}, status=status.HTTP_403_FORBIDDEN)
        
        user_id = request.data.get('user_id')
        role = request.data.get('role', ManualCollaborator.CollaboratorRole.EDITOR)
        
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from accounts.models import User
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is already a collaborator
        if manual.collaborators.filter(user=user).exists():
            return Response({"detail": "User is already a collaborator."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Don't allow adding the creator as a collaborator
        if user == manual.created_by:
            return Response({"detail": "Cannot add the creator as a collaborator."}, status=status.HTTP_400_BAD_REQUEST)
        
        collaborator = ManualCollaborator.objects.create(
            manual=manual,
            user=user,
            role=role,
            added_by=request.user
        )
        
        return Response(ManualCollaboratorSerializer(collaborator).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"], url_path="remove-collaborator/(?P<collaborator_id>[^/.]+)")
    def remove_collaborator(self, request, slug=None, collaborator_id=None):
        manual = self.get_object()
        
        # Only creator can remove collaborators
        if manual.created_by != request.user:
            return Response({"detail": "Only the manual creator can remove collaborators."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            collaborator = manual.collaborators.get(id=collaborator_id)
            collaborator.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ManualCollaborator.DoesNotExist:
            return Response({"detail": "Collaborator not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["get"], url_path="collaborators")
    def list_collaborators(self, request, slug=None):
        manual = self.get_object()
        collaborators = manual.collaborators.all()
        serializer = ManualCollaboratorSerializer(collaborators, many=True)
        return Response(serializer.data)


class ManualVersionViewSet(viewsets.ModelViewSet):
    queryset = ManualVersion.objects.select_related("manual", "created_by").prefetch_related("blocks")
    serializer_class = ManualVersionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrCollaboratorOrReadOnly]

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
    queryset = ReviewRequest.objects.select_related(
        "version", 
        "version__manual", 
        "submitted_by", 
        "reviewer"
    ).order_by("-submitted_at")
    serializer_class = ReviewRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["get"], url_path="content")
    def get_content(self, request, pk=None):
        """Get the content blocks for the manual version being reviewed"""
        review = self.get_object()
        version = review.version
        # Use the existing ManualVersionSerializer which includes blocks
        return Response(ManualVersionSerializer(version).data)

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        # Check if user has permission to approve
        if not hasattr(request.user, 'role') or request.user.role not in ['SUPERVISOR', 'MANAGER', 'CHIEF_MANAGER', 'ADMIN']:
            return Response({"detail": "You don't have permission to approve reviews."}, status=status.HTTP_403_FORBIDDEN)
        
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
        # Check if user has permission to reject
        if not hasattr(request.user, 'role') or request.user.role not in ['SUPERVISOR', 'MANAGER', 'CHIEF_MANAGER', 'ADMIN']:
            return Response({"detail": "You don't have permission to reject reviews."}, status=status.HTTP_403_FORBIDDEN)
        
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

from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid
import secrets
import string
from accounts.models import User


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Category(TimestampedModel):
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=20, default='blue')

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:  # pragma: no cover - for admin readability
        return self.name


class Tag(TimestampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    color = models.CharField(max_length=20, default='blue')

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class Manual(TimestampedModel):
    class ManualStatus(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SUBMITTED = "SUBMITTED", "Submitted"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=320, unique=True)
    reference = models.CharField(max_length=16, editable=False, null=True, blank=True)
    department = models.CharField(max_length=200, blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="manuals"
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="manuals")
    status = models.CharField(
        max_length=20, choices=ManualStatus.choices, default=ManualStatus.DRAFT
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_manuals"
    )
    current_version = models.ForeignKey(
        "ManualVersion", on_delete=models.SET_NULL, null=True, blank=True, related_name="current_for_manuals"
    )

    class Meta:
        ordering = ["-updated_at", "title"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["reference"]),
            models.Index(fields=["status"]),
            models.Index(fields=["department"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return self.title
    
    def generate_reference(self):
        """Generate a unique 16-character reference"""
        while True:
            # Generate 16 character alphanumeric string (uppercase)
            reference = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(16))
            # Ensure uniqueness
            if not Manual.objects.filter(reference=reference).exists():
                return reference
    
    def save(self, *args, **kwargs):
        # Generate reference if not set
        if not self.reference:
            self.reference = self.generate_reference()
        super().save(*args, **kwargs)
    
    def can_edit(self, user):
        """Check if a user can edit this manual"""
        if not user or not user.is_authenticated:
            return False
        
        # Creator can always edit
        if self.created_by == user:
            return True
        
        # Check if user is a collaborator with EDITOR role
        return self.collaborators.filter(user=user, role=ManualCollaborator.CollaboratorRole.EDITOR).exists()
    
    def can_view(self, user):
        """Check if a user can view this manual"""
        if not user or not user.is_authenticated:
            return False
        
        # Creator can always view
        if self.created_by == user:
            return True
        
        # Check if user is a collaborator (any role)
        return self.collaborators.filter(user=user).exists()


class ManualCollaborator(TimestampedModel):
    """Model to track collaborators on manuals"""
    class CollaboratorRole(models.TextChoices):
        EDITOR = "EDITOR", "Editor"
        VIEWER = "VIEWER", "Viewer"
    
    manual = models.ForeignKey(Manual, on_delete=models.CASCADE, related_name="collaborators")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="collaborations"
    )
    role = models.CharField(
        max_length=20, choices=CollaboratorRole.choices, default=CollaboratorRole.EDITOR
    )
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="added_collaborators"
    )
    
    class Meta:
        unique_together = ('manual', 'user')
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        return f"{self.user.username} - {self.manual.title} ({self.role})"


class ManualVersion(TimestampedModel):
    manual = models.ForeignKey(Manual, on_delete=models.CASCADE, related_name="versions")
    version_number = models.PositiveIntegerField()
    changelog = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="manual_versions"
    )
    is_published = models.BooleanField(default=False)
    published_html = models.TextField(blank=True)  # Optional: snapshot of rendered HTML on publish

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("manual", "version_number")
        indexes = [
            models.Index(fields=["manual", "version_number"]),
            models.Index(fields=["is_published"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.manual.title} v{self.version_number}"


class ContentBlock(TimestampedModel):
    class BlockType(models.TextChoices):
        TEXT = "TEXT", "Text"
        IMAGE = "IMAGE", "Image"
        TABLE = "TABLE", "Table"
        CHECKLIST = "CHECKLIST", "Checklist"
        DIAGRAM = "DIAGRAM", "Diagram"
        TABS = "TABS", "Tabs"

    version = models.ForeignKey(
        ManualVersion, on_delete=models.CASCADE, related_name="blocks"
    )
    order = models.PositiveIntegerField()
    type = models.CharField(max_length=20, choices=BlockType.choices)
    data = models.JSONField(default=dict)  # Block-specific payload (e.g., text content, images, etc.)

    class Meta:
        ordering = ["order", "created_at"]
        indexes = [
            models.Index(fields=["version", "order"]),
            models.Index(fields=["type"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"Block {self.order} ({self.type}) for {self.version}"


class ReviewRequest(TimestampedModel):
    class ReviewStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    version = models.ForeignKey(
        ManualVersion, on_delete=models.CASCADE, related_name="review_requests"
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="submitted_reviews"
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, null=True, blank=True, related_name="assigned_reviews"
    )
    status = models.CharField(max_length=20, choices=ReviewStatus.choices, default=ReviewStatus.PENDING)
    feedback = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    decided_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-submitted_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["submitted_at"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"Review for {self.version} ({self.status})"


class AuditLog(models.Model):
    class Action(models.TextChoices):
        CREATE = "CREATE", "Create"
        UPDATE = "UPDATE", "Update"
        SUBMIT = "SUBMIT", "Submit"
        APPROVE = "APPROVE", "Approve"
        REJECT = "REJECT", "Reject"
        ROLLBACK = "ROLLBACK", "Rollback"

    manual = models.ForeignKey(Manual, on_delete=models.CASCADE, null=True, blank=True, related_name="audit_logs")
    version = models.ForeignKey(ManualVersion, on_delete=models.CASCADE, null=True, blank=True, related_name="audit_logs")
    action = models.CharField(max_length=20, choices=Action.choices)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="audit_logs")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["action"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.action} by {self.actor} at {self.created_at}"

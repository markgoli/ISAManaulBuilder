from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid
from accounts.models import User


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Category(TimestampedModel):
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=220, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:  # pragma: no cover - for admin readability
        return self.name


class Tag(TimestampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class Manual(TimestampedModel):
    class ManualStatus(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SUBMITTED = "SUBMITTED", "Submitted"
        APPROVED = "APPROVED", "Approved"
        PUBLISHED = "PUBLISHED", "Published"
        REJECTED = "REJECTED", "Rejected"

    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=320, unique=True)
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
            models.Index(fields=["status"]),
            models.Index(fields=["department"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return self.title


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
        PUBLISH = "PUBLISH", "Publish"
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

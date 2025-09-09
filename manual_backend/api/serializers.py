from rest_framework import serializers

from .models import (
    Category,
    Tag,
    Manual,
    ManualVersion,
    ContentBlock,
    ReviewRequest,
    AuditLog,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "created_at", "updated_at"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug", "created_at", "updated_at"]


class ContentBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentBlock
        fields = [
            "id",
            "version",
            "order",
            "type",
            "data",
            "created_at",
            "updated_at",
        ]


class ManualVersionSerializer(serializers.ModelSerializer):
    blocks = ContentBlockSerializer(many=True, read_only=True)

    class Meta:
        model = ManualVersion
        fields = [
            "id",
            "manual",
            "version_number",
            "changelog",
            "created_by",
            "is_published",
            "published_html",
            "blocks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["is_published", "published_html"]


class ManualSerializer(serializers.ModelSerializer):
    current_version = ManualVersionSerializer(read_only=True)

    class Meta:
        model = Manual
        fields = [
            "id",
            "title",
            "slug",
            "department",
            "category",
            "tags",
            "status",
            "created_by",
            "current_version",
            "created_at",
            "updated_at",
        ]


class ReviewRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewRequest
        fields = [
            "id",
            "version",
            "submitted_by",
            "reviewer",
            "status",
            "feedback",
            "submitted_at",
            "decided_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["submitted_at", "decided_at"]


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = [
            "id",
            "manual",
            "version",
            "action",
            "actor",
            "metadata",
            "created_at",
        ]
        read_only_fields = ["created_at"]
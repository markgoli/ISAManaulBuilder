from rest_framework import serializers

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


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "color", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug", "color", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class ManualCollaboratorSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(write_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    added_by_username = serializers.CharField(source='added_by.username', read_only=True)

    class Meta:
        model = ManualCollaborator
        fields = [
            "id",
            "manual",
            "user_id",
            "user_username", 
            "user_email",
            "user_first_name",
            "user_last_name",
            "role",
            "added_by",
            "added_by_username",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "added_by"]


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
        read_only_fields = ["created_by", "version_number", "is_published", "published_html", "created_at", "updated_at"]


class ManualSerializer(serializers.ModelSerializer):
    current_version = serializers.PrimaryKeyRelatedField(read_only=True)
    collaborators = ManualCollaboratorSerializer(many=True, read_only=True)
    can_edit = serializers.SerializerMethodField()
    can_view = serializers.SerializerMethodField()

    class Meta:
        model = Manual
        fields = [
            "id",
            "title",
            "slug",
            "reference",
            "department",
            "category",
            "tags",
            "status",
            "created_by",
            "current_version",
            "collaborators",
            "can_edit",
            "can_view",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "current_version", "collaborators", "can_edit", "can_view", "reference", "created_at", "updated_at"]
    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.can_edit(request.user)
        return False
    
    def get_can_view(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.can_view(request.user)
        return False


class ReviewRequestSerializer(serializers.ModelSerializer):
    # Nested serializers for related data
    manual_title = serializers.CharField(source='version.manual.title', read_only=True)
    manual_id = serializers.IntegerField(source='version.manual.id', read_only=True)
    manual_reference = serializers.CharField(source='version.manual.reference', read_only=True)
    manual_department = serializers.CharField(source='version.manual.department', read_only=True)
    version_number = serializers.IntegerField(source='version.version_number', read_only=True)
    
    # User details
    submitted_by_name = serializers.SerializerMethodField()
    submitted_by_username = serializers.CharField(source='submitted_by.username', read_only=True)
    reviewer_name = serializers.SerializerMethodField()
    reviewer_username = serializers.CharField(source='reviewer.username', read_only=True)
    
    class Meta:
        model = ReviewRequest
        fields = [
            "id",
            "version",
            "manual_id",
            "manual_reference",
            "manual_title",
            "manual_department",
            "version_number",
            "submitted_by",
            "submitted_by_name",
            "submitted_by_username",
            "reviewer",
            "reviewer_name", 
            "reviewer_username",
            "status",
            "feedback",
            "submitted_at",
            "decided_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["submitted_at", "decided_at"]
    
    def get_submitted_by_name(self, obj):
        """Get the full name of the user who submitted the review"""
        user = obj.submitted_by
        if user.first_name and user.last_name:
            return f"{user.first_name} {user.last_name}"
        return user.username
    
    def get_reviewer_name(self, obj):
        """Get the full name of the reviewer"""
        if obj.reviewer:
            user = obj.reviewer
            if user.first_name and user.last_name:
                return f"{user.first_name} {user.last_name}"
            return user.username
        return None


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
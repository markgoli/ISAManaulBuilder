from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver


class User(AbstractUser):
    class Role(models.TextChoices):
        USER = "USER", "User"
        ANALYST = "ANALYST", "Analyst"
        SUPERVISOR = "SUPERVISOR", "Supervisor"
        MANAGER = "MANAGER", "Manager"
        CHIEF_MANAGER = "CHIEF_MANAGER", "Chief Manager"
        ADMIN = "ADMIN", "Admin"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    department = models.CharField(max_length=200, blank=True)

    def __str__(self) -> str:  # pragma: no cover
        return self.username


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    display_name = models.CharField(max_length=200, blank=True)
    must_change_password = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:  # pragma: no cover
        return f"Profile for {self.user}"


@receiver(post_save, sender=User)
def create_profile_for_user(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_profile_for_user(sender, instance, **kwargs):
    if hasattr(instance, "profile"):
        instance.profile.save()

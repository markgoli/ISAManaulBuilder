from rest_framework import permissions, status, views, generics, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, action
from django.contrib.auth import login, logout
from django.contrib.auth.password_validation import validate_password
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.contrib.auth.hashers import make_password
import time

from .models import User, Profile
from .serializers import (
    UserSerializer,
    ProfileSerializer,
    RegisterSerializer,
    LoginSerializer,
    PasswordChangeSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return Response(UserSerializer(user).data)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Logged out"})


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"detail": "CSRF cookie set"})


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        old_password = serializer.validated_data["old_password"]
        new_password = serializer.validated_data["new_password"]
        if not user.check_password(old_password):
            return Response({"old_password": ["Incorrect password."]}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        # Clear must_change_password flag after successful password change
        if hasattr(user, 'profile'):
            user.profile.must_change_password = False
            user.profile.save()
        return Response({"detail": "Password changed successfully."})


class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """
        Only admins can manage users
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
            # Add admin check here if needed
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def create(self, request, *args, **kwargs):
        """
        Create a new user with default password 'temp123'
        """
        data = request.data.copy()
        data['password'] = 'temp123'  # Set default password
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Create user with hashed password
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            first_name=serializer.validated_data.get('first_name', ''),
            last_name=serializer.validated_data.get('last_name', ''),
            role=serializer.validated_data.get('role', User.Role.USER),
            department=serializer.validated_data.get('department', ''),
            password='temp123'
        )
        
        # Set must_change_password flag
        user.profile.must_change_password = True
        user.profile.save()
        
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """
        Reset user password to 'temp123' and require password change
        """
        user = self.get_object()
        user.set_password('temp123')
        user.save()
        
        # Set must_change_password flag
        user.profile.must_change_password = True
        user.profile.save()
        
        return Response({"detail": "Password reset to temp123. User must change password on next login."})
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """
        Toggle user active status
        """
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        
        return Response({"detail": f"User {'activated' if user.is_active else 'deactivated'} successfully."})


class FirstLoginView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Check if user must change password
        """
        must_change = request.user.profile.must_change_password if hasattr(request.user, 'profile') else False
        return Response({"must_change_password": must_change})
    
    def post(self, request):
        """
        Handle first login password change
        """
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response({"error": "Both old_password and new_password are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        
        # Verify old password
        if not user.check_password(old_password):
            return Response({"old_password": ["Incorrect password."]}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate new password
        try:
            validate_password(new_password, user)
        except Exception as e:
            return Response({"new_password": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        # Clear must_change_password flag
        if hasattr(user, 'profile'):
            user.profile.must_change_password = False
            user.profile.save()
        
        return Response({"detail": "Password changed successfully."})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def extend_session(request):
    """
    Extend the user's session by resetting the session timestamp.
    """
    try:
        # Reset session timestamp to extend the session
        request.session['_session_init_timestamp_'] = time.time()
        request.session.save()
        
        return Response({
            "detail": "Session extended successfully.",
            "remaining_time": 1800,  # 30 minutes
            "extended_at": time.time()
        })
    except Exception as e:
        return Response(
            {"error": "Failed to extend session.", "detail": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

"""
Session timeout middleware for handling session expiration and warnings.
"""
import time
from django.http import JsonResponse
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin


class SessionTimeoutMiddleware(MiddlewareMixin):
    """
    Middleware to handle session timeout and add session info to API responses.
    """
    
    def process_response(self, request, response):
        """
        Add session timeout information to API responses.
        """
        # Only add session info to API responses (JSON)
        if (hasattr(request, 'user') and 
            request.user.is_authenticated and 
            request.path.startswith('/api/') and
            response.get('Content-Type', '').startswith('application/json')):
            
            try:
                # Calculate session expiry time
                session_age = settings.SESSION_COOKIE_AGE
                last_activity = request.session.get('_session_init_timestamp_', time.time())
                current_time = time.time()
                
                # Update last activity timestamp
                request.session['_session_init_timestamp_'] = current_time
                
                # Calculate remaining time
                elapsed_time = current_time - last_activity
                remaining_time = max(0, session_age - elapsed_time)
                
                # Add session info to response headers
                response['X-Session-Remaining'] = str(int(remaining_time))
                response['X-Session-Warning'] = 'true' if remaining_time < 300 else 'false'  # 5 minutes warning
                response['X-Session-Expired'] = 'true' if remaining_time <= 0 else 'false'
                
                # If session is expired, return 401
                if remaining_time <= 0:
                    return JsonResponse({
                        'error': 'Session expired',
                        'message': 'Your session has expired. Please log in again.',
                        'session_expired': True
                    }, status=401)
                    
            except Exception as e:
                # Log error but don't break the response
                print(f"Session timeout middleware error: {e}")
        
        return response
    
    def process_request(self, request):
        """
        Initialize session timestamp if not present.
        """
        if hasattr(request, 'user') and request.user.is_authenticated:
            if '_session_init_timestamp_' not in request.session:
                request.session['_session_init_timestamp_'] = time.time()
        
        return None

'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, redirect to login
      router.push('/login');
      return;
    }

    if (!loading && user) {
      // Check if user must change password (first login)
      const mustChangePassword = user.profile?.must_change_password;
      
      // If user must change password and they're not already on the first-login page
      if (mustChangePassword && pathname !== '/first-login') {
        router.push('/first-login');
        return;
      }
      
      // If user doesn't need to change password but they're on the first-login page
      if (!mustChangePassword && pathname === '/first-login') {
        router.push('/');
        return;
      }
    }
  }, [user, loading, router, pathname]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if user is not authenticated
  if (!user) {
    return null;
  }

  // If user must change password and not on first-login page, show loading
  if (user.profile?.must_change_password && pathname !== '/first-login') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to password change...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

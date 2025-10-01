"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { firstLoginPasswordChange, checkFirstLogin } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function FirstLoginPage() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mustChange, setMustChange] = useState(false);
  const router = useRouter();
  const { refresh, user, logout } = useAuth();

  useEffect(() => {
    // Since ProtectedRoute handles the redirect logic, we can assume
    // that if user reaches this page, they need to change password
    setMustChange(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await firstLoginPasswordChange(formData.oldPassword, formData.newPassword);
      
      // Refresh user data to update must_change_password flag
      await refresh();
      
      setSuccess(true);
      
      // Redirect to dashboard after successful password change
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Logout function in AuthContext already redirects to login page
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login
      router.push('/login');
    }
  };

  if (!mustChange) {
    return (
      <div className="min-h-screen flex items-center justify-center login-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking password status...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center login-bg">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Password Changed Successfully!</h2>
            {user && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  Password updated for: {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user.username}
                </p>
                <p className="text-xs text-green-600">@{user.username}</p>
              </div>
            )}
            <p className="text-gray-600 mb-4">
              Your password has been updated. You will be redirected to the dashboard shortly.
            </p>
            <div className="animate-pulse text-blue-600">Redirecting...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center login-bg">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Axora</h1>
            <p className="text-sm text-white/80"></p>
          </div>

          {/* Logout Option */}
          <div className="text-center mb-4">
            <button
              onClick={handleLogout}
              className="text-white/80 hover:text-white text-sm transition-colors"
            >
              ← Back to Login
            </button>
          </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-700">Change Your Password</CardTitle>
            {user && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  Welcome, {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user.username}
                </p>
              </div>
            )}
            <p className="text-gray-600 mt-3">
              For security reasons, you must change your password before continuing.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={formData.oldPassword}
                onChange={(e) => handleInputChange('oldPassword', e.target.value)}
                placeholder="Enter your current password (temp123)"
                required
              />
              
              <Input
                label="New Password"
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="Enter your new password"
                required
              />
              
              <Input
                label="Confirm New Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your new password"
                required
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <div className="text-red-400">⚠️</div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </Button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Must be different from your current password</li>
                <li>• Should contain a mix of letters, numbers, and symbols</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

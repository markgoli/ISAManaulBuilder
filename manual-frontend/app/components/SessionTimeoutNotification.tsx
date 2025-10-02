'use client';

import React, { useState, useEffect } from 'react';
import { useSessionTimeout } from '@/app/hooks/useSessionTimeout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Badge from '@/app/components/ui/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faExclamationTriangle, faSync, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

interface SessionTimeoutNotificationProps {
  className?: string;
}

export const SessionTimeoutNotification: React.FC<SessionTimeoutNotificationProps> = ({ 
  className = '' 
}) => {
  const { user, logout } = useAuth();
  const { remainingTime, isWarning, isExpired, extendSession, formatTime } = useSessionTimeout();
  const [isExtending, setIsExtending] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Show notification when warning or expired
  useEffect(() => {
    setShowNotification(isWarning || isExpired);
  }, [isWarning, isExpired]);

  // Handle session extension
  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      await extendSession();
      setShowNotification(false);
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setIsExtending(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  // Don't render if user is not authenticated
  if (!user) return null;

  // Session expired modal
  if (isExpired) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md shadow-2xl border-red-200">
          <CardHeader className="text-center pb-4">
             <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
               <FontAwesomeIcon icon={faExclamationTriangle} className="w-8 h-8 text-red-600" />
             </div>
            <CardTitle className="text-xl text-red-700">Session Expired</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your session has expired due to inactivity. Please log in again to continue.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleLogout}
                className="w-full"
                variant="primary"
              >
                 <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-2" />
                 Return to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session warning notification
  if (showNotification && isWarning) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 p-4">
        <Card className="w-full max-w-md shadow-2xl border-amber-200">
          <CardHeader className="text-center pb-4">
             <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
               <FontAwesomeIcon icon={faClock} className="w-8 h-8 text-amber-600" />
             </div>
            <CardTitle className="text-xl text-amber-700">Session Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-gray-600">
                Your session will expire in:
              </p>
              <div className="text-3xl font-bold text-amber-600">
                {formatTime(remainingTime)}
              </div>
              <p className="text-sm text-gray-500">
                You'll be automatically logged out when the timer reaches zero.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleExtendSession}
                disabled={isExtending}
                className="w-full"
                variant="primary"
              >
                 {isExtending ? (
                   <>
                     <FontAwesomeIcon icon={faSync} className="w-4 h-4 mr-2 animate-spin" />
                     Extending Session...
                   </>
                 ) : (
                   <>
                     <FontAwesomeIcon icon={faSync} className="w-4 h-4 mr-2" />
                     Extend Session (30 min)
                   </>
                 )}
              </Button>
              
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                 <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-2" />
                 Logout Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

// Session status indicator for the navbar
export const SessionStatusIndicator: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  const { user } = useAuth();
  const { remainingTime, isWarning, formatTime } = useSessionTimeout();

  if (!user) return null;

  return (
     <div className={`flex items-center gap-2 ${className}`}>
       <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-gray-400" />
       <Badge 
         color={isWarning ? 'red' : 'gray'}
         variant="default"
         className="text-xs"
       >
         {formatTime(remainingTime)}
       </Badge>
     </div>
  );
};

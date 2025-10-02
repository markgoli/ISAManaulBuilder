'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface SessionTimeoutState {
  remainingTime: number;
  isWarning: boolean;
  isExpired: boolean;
  lastActivity: number;
}

interface UseSessionTimeoutReturn extends SessionTimeoutState {
  extendSession: () => Promise<void>;
  resetTimeout: () => void;
  formatTime: (seconds: number) => string;
}

export const useSessionTimeout = (): UseSessionTimeoutReturn => {
  const { user, logout } = useAuth();
  const [sessionState, setSessionState] = useState<SessionTimeoutState>({
    remainingTime: 1800, // 30 minutes default
    isWarning: false,
    isExpired: false,
    lastActivity: Date.now(),
  });

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Reset timeout on user activity
  const resetTimeout = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      lastActivity: Date.now(),
    }));
  }, []);

  // Extend session by making an API call
  const extendSession = useCallback(async () => {
    try {
      // Call the dedicated session extension endpoint
      const response = await fetch('/api/auth/extend-session/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        resetTimeout();
        setSessionState(prev => ({
          ...prev,
          remainingTime: data.remaining_time || 1800, // Reset to 30 minutes
          isWarning: false,
          isExpired: false,
        }));
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  }, [resetTimeout]);

  // Monitor API responses for session info
  useEffect(() => {
    if (!user) return;

    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Check for session timeout headers
      if (response.headers) {
        const remainingTime = response.headers.get('X-Session-Remaining');
        const isWarning = response.headers.get('X-Session-Warning') === 'true';
        const isExpired = response.headers.get('X-Session-Expired') === 'true';
        
        if (remainingTime) {
          setSessionState(prev => ({
            ...prev,
            remainingTime: parseInt(remainingTime, 10),
            isWarning,
            isExpired,
            lastActivity: Date.now(),
          }));
        }
        
        // Handle session expiration
        if (isExpired) {
          await logout();
          return response;
        }
      }
      
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [user, logout]);

  // Client-side countdown timer
  useEffect(() => {
    if (!user || sessionState.isExpired) return;

    const interval = setInterval(() => {
      setSessionState(prev => {
        const elapsed = Math.floor((Date.now() - prev.lastActivity) / 1000);
        const newRemainingTime = Math.max(0, 1800 - elapsed);
        
        const newIsWarning = newRemainingTime <= 300 && newRemainingTime > 0; // 5 minutes warning
        const newIsExpired = newRemainingTime <= 0;
        
        // Auto-logout when expired
        if (newIsExpired && !prev.isExpired) {
          setTimeout(() => logout(), 100);
        }
        
        return {
          ...prev,
          remainingTime: newRemainingTime,
          isWarning: newIsWarning,
          isExpired: newIsExpired,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user, logout, sessionState.lastActivity, sessionState.isExpired]);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, resetTimeout]);

  return {
    ...sessionState,
    extendSession,
    resetTimeout,
    formatTime,
  };
};

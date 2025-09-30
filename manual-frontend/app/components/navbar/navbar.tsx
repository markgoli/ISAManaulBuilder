"use client";

import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
            // Error is handled in AuthContext
        } finally {
            setLoggingOut(false);
        }
    };
    return (
        <nav className="w-full fixed left-0 top-0 border-b border-[--color-border] p-4 bg-white z-10 flex items-center justify-between">
            <Link href="/" className="font-semibold">Manual Builder</Link>
            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <Link href="/dashboard">Dashboard</Link>
                        <Link href="/profile">{user.first_name || user.username}</Link>
                        <button 
                            className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed" 
                            onClick={handleLogout} 
                            disabled={loggingOut || loading}
                        >
                            {loggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                    </>
                ) : (
                    <Link href="/login" className="text-sm">Login</Link>
                )}
            </div>
        </nav>
    )
}

export default Navbar;
"use client";

import { useAuth } from "../../context/AuthContext";

export default function TopNavBar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side - Menu and Breadcrumb */}
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-100 rounded">
          <span className="text-gray-600">☰</span>
        </button>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-blue-600 font-medium">Dashboard</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-600">Home</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-500">Dashboard</span>
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center space-x-3">
        {/* User Profile */}
        <div className="flex items-center">
          <button className="w-8 h-8 bg-gray-300 rounded-full"></button>
        </div>
      </div>
    </header>
  );
}

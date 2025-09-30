'use client';

import React from 'react';

type BadgeVariant = 'default' | 'solid' | 'outline' | 'soft';
type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeColor = 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'pink';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  icon?: React.ReactNode;
  dot?: boolean;
}

const badgeColors: Record<BadgeColor, Record<BadgeVariant, string>> = {
  gray: {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    solid: 'bg-gray-600 text-white border-gray-600',
    outline: 'bg-transparent text-gray-700 border-gray-300',
    soft: 'bg-gray-50 text-gray-700 border-gray-100'
  },
  blue: {
    default: 'bg-blue-100 text-blue-800 border-blue-200',
    solid: 'bg-blue-600 text-white border-blue-600',
    outline: 'bg-transparent text-blue-700 border-blue-300',
    soft: 'bg-blue-50 text-blue-700 border-blue-100'
  },
  green: {
    default: 'bg-green-100 text-green-800 border-green-200',
    solid: 'bg-green-600 text-white border-green-600',
    outline: 'bg-transparent text-green-700 border-green-300',
    soft: 'bg-green-50 text-green-700 border-green-100'
  },
  yellow: {
    default: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    solid: 'bg-yellow-500 text-white border-yellow-500',
    outline: 'bg-transparent text-yellow-700 border-yellow-300',
    soft: 'bg-yellow-50 text-yellow-700 border-yellow-100'
  },
  red: {
    default: 'bg-red-100 text-red-800 border-red-200',
    solid: 'bg-red-600 text-white border-red-600',
    outline: 'bg-transparent text-red-700 border-red-300',
    soft: 'bg-red-50 text-red-700 border-red-100'
  },
  purple: {
    default: 'bg-purple-100 text-purple-800 border-purple-200',
    solid: 'bg-purple-600 text-white border-purple-600',
    outline: 'bg-transparent text-purple-700 border-purple-300',
    soft: 'bg-purple-50 text-purple-700 border-purple-100'
  },
  indigo: {
    default: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    solid: 'bg-indigo-600 text-white border-indigo-600',
    outline: 'bg-transparent text-indigo-700 border-indigo-300',
    soft: 'bg-indigo-50 text-indigo-700 border-indigo-100'
  },
  pink: {
    default: 'bg-pink-100 text-pink-800 border-pink-200',
    solid: 'bg-pink-600 text-white border-pink-600',
    outline: 'bg-transparent text-pink-700 border-pink-300',
    soft: 'bg-pink-50 text-pink-700 border-pink-100'
  }
};

const badgeSizes: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm'
};

export default function Badge({ 
  children, 
  color = 'gray', 
  variant = 'default',
  size = 'sm',
  className = '',
  icon,
  dot = false
}: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full font-medium border transition-colors
      ${badgeColors[color][variant]}
      ${badgeSizes[size]}
      ${className}
    `}>
      {dot && (
        <span className={`
          w-1.5 h-1.5 rounded-full
          ${variant === 'solid' ? 'bg-white' : badgeColors[color].solid.split(' ')[0]}
        `} />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// Status-specific badge components for common use cases
export function StatusBadge({ status, ...props }: { status: 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning' } & Omit<BadgeProps, 'color'>) {
  const statusColors: Record<string, BadgeColor> = {
    active: 'green',
    inactive: 'gray',
    pending: 'yellow',
    success: 'green',
    error: 'red',
    warning: 'yellow'
  };

  return <Badge color={statusColors[status]} {...props} />;
}



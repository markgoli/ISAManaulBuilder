'use client';

import React from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'subtle';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  hover?: boolean;
}

const cardVariants: Record<CardVariant, string> = {
  default: 'bg-white border border-slate-200 shadow-sm',
  elevated: 'bg-white border border-slate-200 shadow-lg',
  outlined: 'bg-white border-2 border-slate-200 shadow-none',
  subtle: 'bg-slate-50 border border-slate-100 shadow-none'
};

export function Card({ children, className = '', variant = 'default', hover = false }: CardProps) {
  return (
    <div className={`
      rounded-xl transition-all duration-200
      ${cardVariants[variant]}
      ${hover ? 'hover:shadow-md hover:border-slate-300 cursor-pointer' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', noBorder = false }: { 
  children: React.ReactNode; 
  className?: string;
  noBorder?: boolean;
}) {
  return (
    <div className={`
      px-6 py-5
      ${!noBorder ? 'border-b border-slate-200' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '', padding = 'normal' }: { 
  children: React.ReactNode; 
  className?: string;
  padding?: 'none' | 'sm' | 'normal' | 'lg';
}) {
  const paddingClasses = {
    none: '',
    sm: 'px-4 py-3',
    normal: 'px-6 py-5',
    lg: 'px-8 py-6'
  };

  return (
    <div className={`${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', size = 'lg' }: { 
  children: React.ReactNode; 
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizeClasses = {
    sm: 'text-sm font-semibold text-blue-700',
    md: 'text-base font-semibold text-blue-700',
    lg: 'text-lg font-semibold text-blue-700',
    xl: 'text-xl font-bold text-blue-700'
  };

  return (
    <h3 className={`${sizeClasses[size]} ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <p className={`text-sm text-slate-500 mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function CardFooter({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl ${className}`}>
      {children}
    </div>
  );
}

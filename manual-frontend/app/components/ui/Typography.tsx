'use client';

import React from 'react';

// Heading components
interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function Heading({ children, className = '', level = 1 }: HeadingProps) {
  const headingClasses = {
    1: 'text-3xl font-bold text-blue-500 tracking-tight',
    2: 'text-2xl font-semibold text-blue-500 tracking-tight',
    3: 'text-xl font-semibold text-blue-400',
    4: 'text-lg font-medium text-blue-400',
    5: 'text-base font-medium text-blue-400',
    6: 'text-sm font-medium text-blue-400'
  };

  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <Tag className={`${headingClasses[level]} ${className}`}>
      {children}
    </Tag>
  );
}

// Text components
interface TextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'body' | 'caption' | 'small' | 'lead' | 'muted';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'subtle' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const textVariants = {
  body: 'text-slate-600',
  caption: 'text-sm text-slate-500',
  small: 'text-xs text-slate-400',
  lead: 'text-lg text-slate-500 font-light',
  muted: 'text-slate-400'
};

const textSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

const textWeights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
};

const textColors = {
  default: 'text-slate-600',
  muted: 'text-slate-500',
  subtle: 'text-slate-400',
  primary: 'text-blue-500', 
  secondary: 'text-slate-500',
  success: 'text-emerald-600',
  warning: 'text-amber-500',
  danger: 'text-red-500'
};

export function Text({ 
  children, 
  className = '', 
  variant,
  size,
  weight,
  color 
}: TextProps) {
  let textClasses = '';

  if (variant) {
    textClasses = textVariants[variant];
  } else {
    // Build classes from individual props
    const sizeClass = size ? textSizes[size] : 'text-base';
    const weightClass = weight ? textWeights[weight] : '';
    const colorClass = color ? textColors[color] : 'text-slate-600';
    textClasses = `${sizeClass} ${weightClass} ${colorClass}`.trim();
  }

  return (
    <p className={`${textClasses} ${className}`}>
      {children}
    </p>
  );
}

// Link component
interface LinkProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  variant?: 'default' | 'subtle' | 'primary';
  external?: boolean;
  onClick?: () => void;
}

const linkVariants = {
  default: 'text-blue-600 hover:text-blue-800 underline underline-offset-2',
  subtle: 'text-gray-600 hover:text-gray-800 hover:underline underline-offset-2',
  primary: 'text-blue-600 hover:text-blue-800 font-medium hover:underline underline-offset-2'
};

export function Link({ 
  children, 
  href, 
  className = '', 
  variant = 'default',
  external = false,
  onClick 
}: LinkProps) {
  const linkClasses = `${linkVariants[variant]} transition-colors cursor-pointer ${className}`;

  if (onClick) {
    return (
      <button onClick={onClick} className={linkClasses}>
        {children}
      </button>
    );
  }

  if (external) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={linkClasses}
      >
        {children}
        <svg className="inline h-3 w-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </a>
    );
  }

  return (
    <a href={href} className={linkClasses}>
      {children}
    </a>
  );
}

// Code component
interface CodeProps {
  children: React.ReactNode;
  className?: string;
  block?: boolean;
}

export function Code({ children, className = '', block = false }: CodeProps) {
  const baseClasses = 'font-mono text-sm bg-gray-100 text-gray-800 border border-gray-200';
  
  if (block) {
    return (
      <pre className={`${baseClasses} rounded-lg p-4 overflow-x-auto ${className}`}>
        <code>{children}</code>
      </pre>
    );
  }

  return (
    <code className={`${baseClasses} rounded px-1.5 py-0.5 ${className}`}>
      {children}
    </code>
  );
}

// List components
interface ListProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'bullet' | 'number' | 'none';
  spacing?: 'tight' | 'normal' | 'relaxed';
}

const listSpacing = {
  tight: 'space-y-1',
  normal: 'space-y-2',
  relaxed: 'space-y-3'
};

export function List({ children, className = '', variant = 'bullet', spacing = 'normal' }: ListProps) {
  const Tag = variant === 'number' ? 'ol' : 'ul';
  const listClasses = `
    ${variant === 'bullet' ? 'list-disc list-inside' : ''}
    ${variant === 'number' ? 'list-decimal list-inside' : ''}
    ${listSpacing[spacing]}
    text-gray-700
    ${className}
  `;

  return <Tag className={listClasses}>{children}</Tag>;
}

export function ListItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <li className={`${className}`}>{children}</li>;
}

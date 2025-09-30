'use client';

import React from 'react';

type InputSize = 'sm' | 'md' | 'lg';
type InputVariant = 'default' | 'filled' | 'flushed';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helper?: string;
  error?: string;
  size?: InputSize;
  variant?: InputVariant;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const inputSizes: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base'
};

const inputVariants: Record<InputVariant, string> = {
  default: 'border border-gray-300 rounded-lg bg-white',
  filled: 'border border-gray-200 rounded-lg bg-gray-50 focus:bg-white',
  flushed: 'border-0 border-b-2 border-gray-300 rounded-none bg-transparent px-0'
};

export default function Input({ 
  label, 
  helper, 
  error, 
  className = '', 
  size = 'md',
  variant = 'default',
  icon,
  iconPosition = 'left',
  ...props 
}: InputProps) {
  const hasError = !!error;
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-blue-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-400">{icon}</span>
          </div>
        )}
        
        <input
          {...props}
          id={inputId}
          className={`
            w-full transition-all duration-200 outline-none
            text-slate-600 placeholder-slate-400
            ${inputVariants[variant]}
            ${inputSizes[size]}
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${hasError 
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
              : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400'
            }
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200
            ${className}
          `}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-slate-400">{icon}</span>
          </div>
        )}
      </div>
      
      {(helper || error) && (
        <div className="mt-2">
          {error ? (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          ) : helper ? (
            <p className="text-sm text-slate-500">{helper}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}



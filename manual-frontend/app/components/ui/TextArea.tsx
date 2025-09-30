'use client';

import React from 'react';

type TextAreaSize = 'sm' | 'md' | 'lg';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helper?: string;
  error?: string;
  size?: TextAreaSize;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const textAreaSizes: Record<TextAreaSize, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[80px]',
  md: 'px-3 py-2 text-sm min-h-[100px]',
  lg: 'px-4 py-3 text-base min-h-[120px]'
};

const resizeClasses: Record<string, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize'
};

export default function TextArea({ 
  label, 
  helper, 
  error, 
  className = '', 
  size = 'md',
  resize = 'vertical',
  ...props 
}: TextAreaProps) {
  const hasError = !!error;
  const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-blue-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        {...props}
        id={textareaId}
        className={`
          w-full transition-all duration-200 outline-none
          border border-gray-300 rounded-lg bg-white
          text-slate-600 placeholder-slate-400
          ${textAreaSizes[size]}
          ${resizeClasses[resize]}
          ${hasError 
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
            : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400'
          }
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200
          ${className}
        `}
      />
      
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

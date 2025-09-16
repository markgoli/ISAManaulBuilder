'use client';

import React from 'react';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string };

export default function TextArea({ label, className = '', ...props }: Props) {
  return (
    <label className="flex flex-col gap-1 w-full">
      {label && (
        <span className="text-sm font-medium text-gray-700 mb-1">
          {label}
        </span>
      )}
      <textarea
        {...props}
        className={`
          border border-gray-300 rounded-md px-3 py-2 w-full
          text-gray-900 placeholder-gray-500
          bg-white
          transition-colors duration-200
          outline-none
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          hover:border-gray-400
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          resize-vertical
          ${className}
        `}
      />
    </label>
  );
}

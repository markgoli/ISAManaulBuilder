'use client';

import React from 'react';

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string };

export default function Select({ label, className = '', children, ...props }: Props) {
  return (
    <label className="flex flex-col gap-1 w-full">
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <select
        {...props}
        className={`border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent w-full bg-white ${className}`}
      >
        {children}
      </select>
    </label>
  );
}

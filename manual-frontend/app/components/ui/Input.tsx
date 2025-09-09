'use client';

import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string };

export default function Input({ label, className = '', ...props }: Props) {
  return (
    <label className="flex flex-col gap-1 w-full">
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <input
        {...props}
        className={`border rounded px-3 py-2 outline-none focus:ring w-full ${className}`}
      />
    </label>
  );
}



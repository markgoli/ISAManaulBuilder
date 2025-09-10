'use client';

import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export default function Button({ loading, children, className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-md bg-[--color-primary] text-[--color-primary-foreground] hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${className}`}
      disabled={loading || props.disabled}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}



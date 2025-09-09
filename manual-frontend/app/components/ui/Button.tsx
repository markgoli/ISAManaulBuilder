'use client';

import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export default function Button({ loading, children, className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-60 ${className}`}
      disabled={loading || props.disabled}
    >
      {loading ? 'Loading…' : children}
    </button>
  );
}



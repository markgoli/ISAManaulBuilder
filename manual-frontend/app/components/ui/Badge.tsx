'use client';

import React from 'react';

export default function Badge({ color = 'gray', children }: { color?: 'gray' | 'blue' | 'green' | 'yellow' | 'red'; children: React.ReactNode }) {
  const map: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs border ${map[color]}`}>{children}</span>
  );
}



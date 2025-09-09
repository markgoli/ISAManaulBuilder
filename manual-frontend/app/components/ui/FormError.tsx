'use client';

export default function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
      {message}
    </div>
  );
}



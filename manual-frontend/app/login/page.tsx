'use client';

import { useState } from 'react';
import Image from 'next/image';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import FormError from '../components/ui/FormError';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const { login, error, loading, user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (user) {
    router.replace('/');
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(username, password);
      const next = params.get('next');
      router.replace(next || '/');
    } catch (e: any) {
      setLocalError(e.message || 'Login failed');
    }
  }

  return (
    <div className="login-bg flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-white/0 grid grid-cols-1 md:grid-cols-2">
        {/* Left branding panel */}
        <div className="hidden md:flex flex-col items-center justify-center gap-5 panel-left text-white">
          <div className="flex items-center justify-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]">
            {/* Place your company logo at public/company-logo.png */}
            <Image src="/logo/logo.png" alt="Company Logo" width={200} height={200} />
          </div>
          <div className="text-center">
            <h2 className="text-[18px] font-medium">ISA Manual Builder</h2>
            <p className="text-[12px] text-white/80">Sign in to continue</p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="bg-white p-8 md:p-10">
          <h1 className="text-center text-gray-800 text-[18px] font-semibold mb-6">Sign In</h1>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="text-blue-600" />
            <div className="relative">
              <Input
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-blue-600"
              />
              <button
                type="button"
                className="absolute right-3 top-[34px] text-sm text-gray-500"
                onClick={() => setShowPwd((v) => !v)}
                aria-label="Toggle password visibility"
              >
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
            <FormError message={localError || error} />
            <Button type="submit" loading={loading} className="w-full rounded-md h-[44px] text-[14px]">Sign In</Button>
          </form>
          <p className="mt-8 text-center text-[11px] text-gray-500">
            © {new Date().getFullYear()} ISA Manual Builder. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}



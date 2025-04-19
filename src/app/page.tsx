"use client";

import LoginForm from '@/components/LoginForm';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to quotation page after login
    router.push('/quotation');
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <LoginForm />
    </main>
  );
}

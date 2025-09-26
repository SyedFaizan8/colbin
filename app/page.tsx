'use client';
import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';

type User = { id: string; email: string; name?: string; } | null;

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          // include credentials explicitly (same-origin doesn't need it but safe)
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) {
          if (mounted) setUser(null);
          // if 401 show not signed in view quietly
          if (res.status !== 401) {
            if (mounted) setError(data.error || 'Failed to load profile');
          }
        } else {
          if (mounted) setUser(data.user);
        }
      } catch (err) {
        if (mounted) setError('Network error');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      // clear client-side view; server cleared cookie
      if (res.ok) {
        setUser(null);
        // Soft redirect to login page
        location.href = '/(auth)/login';
      } else {
        const data = await res.json();
        setError(data.error || 'Logout failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoggingOut(false);
    }
  }

  // Loading state
  if (loading) return (
    <main className="max-w-lg mx-auto mt-20 center h-40">
      <div className="small-muted">Loading profile…</div>
    </main>
  );

  // If there was an error not related to unauthenticated state, show it
  if (error) return (
    <main className="max-w-lg mx-auto mt-20">
      <div className="text-red-400">{error}</div>
    </main>
  );

  // Unauthenticated view
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Card className="text-center">
          <h2 className="text-2xl font-semibold mb-2">You are not signed in</h2>
          <p className="small-muted mb-6">Sign in to view your profile and manage your account.</p>

          <div className="flex items-center justify-center gap-3">
            <Link href="/login" className='btn-accent px-6'>Sign in</Link>
            <Link href="/register" className="px-4 py-2 rounded-md hover:bg-white/3">Create account</Link>
          </div>
        </Card>
      </div>
    );
  }

  // Authenticated view
  return (
    <div className="max-w-2xl mx-auto mt-12 grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hello, {user.name ?? 'User'}</h1>
          <div className="small-muted mt-1">Welcome back — this is your profile.</div>
        </div>
        <div>
          <Button onClick={handleLogout} disabled={loggingOut}>{loggingOut ? 'Signing out…' : 'Sign out'}</Button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="small-muted">Full name</div>
            <div className="mt-1 font-medium text-lg">{user.name ?? '—'}</div>
          </div>
          <div>
            <div className="small-muted">Email</div>
            <div className="mt-1 font-medium text-lg">{user.email}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

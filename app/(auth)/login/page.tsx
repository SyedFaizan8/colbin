// app/(auth)/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            setLoading(false);
            if (!res.ok) return setError(data.error || 'Login failed');
            router.push('/');
        } catch (err) {
            setLoading(false);
            setError('Network error');
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20">
            <Card>
                <h2 className="text-2xl font-semibold mb-2">Welcome back</h2>
                <p className="small-muted mb-4">Sign in to continue to HireFlow</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
                    <Input label="Password" type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} />

                    {error && <div className="text-red-400">{error}</div>}

                    <div className="flex items-center justify-between">
                        <div onClick={() => router.push('/register')} className="cursor-pointer small-muted text-sm a-accent">New User?</div>
                        <Button type="submit" className="px-6" disabled={loading}>{loading ? 'Signing...' : 'Sign in'}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

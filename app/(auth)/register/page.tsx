// app/(auth)/register/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });
            const data = await res.json();
            setLoading(false);
            if (!res.ok) return setError(data.error || 'Failed to register');
            router.push('/login');
        } catch (err) {
            setLoading(false);
            setError('Network error');
        }
    }

    return (
        <div className="max-w-2xl mx-auto mt-16">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Create your account</h1>
                <p className="small-muted mt-2">Join HireFlow — a simple recruitment prototype.</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Full name" placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} />
                        <Input label="Email" placeholder="you@company.com" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>

                    <Input label="Password" placeholder="At least 6 characters" type="password" value={password} onChange={e => setPassword(e.target.value)} hint="We recommend a strong password" />

                    {error && <div className="text-red-400">{error}</div>}

                    <div className="flex items-center justify-between mt-2">
                        <div className="small-muted">Already have an account? <a href="/login" className="a-accent">Login</a></div>
                        <Button type="submit" className="px-6" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

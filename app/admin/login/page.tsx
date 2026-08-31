'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

const adminLoginSchema = z.object({
    email: z.email('Enter a valid email address'),
    password: z.string().min(1, 'Enter your password'),
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [authAvailable, setAuthAvailable] = useState<boolean | null>(null);
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AdminLoginValues>({
        resolver: zodResolver(adminLoginSchema),
        defaultValues: { email: '', password: '' },
    });

    useEffect(() => {
        let active = true;

        fetch('/api/admin/auth-status', { cache: 'no-store' })
            .then(async (response) => {
                const payload = await response.json() as { available?: boolean };
                return response.ok && payload.available === true;
            })
            .catch(() => false)
            .then((available) => {
                if (active) setAuthAvailable(available);
            });

        return () => { active = false; };
    }, []);

    const handleLogin = async (values: AdminLoginValues) => {
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            const payload = await response.json() as { ok?: boolean; message?: string };

            if (!response.ok || !payload.ok) {
                setError(payload.message ?? 'Unable to sign in');
                return;
            }

            router.push('/admin');
            router.refresh();
        } catch {
            setAuthAvailable(false);
            setError('The admin service is temporarily unavailable');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-theme flex min-h-screen items-center justify-center bg-bg p-4">
            <div className="w-full max-w-md">
                <div className="rounded-lg border border-border bg-card-bg p-8">
                    <div className="mb-8 text-center">
                        <div className="flex flex-col items-center leading-tight">
                            <div className="text-3xl font-bold tracking-wide text-accent">DURRAT.</div>
                            <div className="text-xs font-medium tracking-[0.2em] text-accent/80">CONSTRUCTION</div>
                        </div>
                        <p className="mt-4 text-text-muted">Admin Login</p>
                    </div>

                    <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
                        {error && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400" role="alert">
                                {error}
                            </div>
                        )}
                        {authAvailable === false && !error && (
                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300" role="status">
                                The admin database is currently unavailable.
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-text">Email</label>
                            <input
                                type="email"
                                id="email"
                                {...register('email')}
                                autoComplete="username"
                                className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text focus:border-accent focus:outline-none"
                                placeholder="admin@example.com"
                            />
                            {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-text">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    {...register('password')}
                                    autoComplete="current-password"
                                    className="w-full rounded-lg border border-border bg-bg px-4 py-3 pr-12 text-text focus:border-accent focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted transition-colors hover:text-text"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={authAvailable !== true || loading}
                            className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {authAvailable === null ? 'Checking admin service...' : loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-text-muted">
                        <Link href="/" className="text-accent hover:underline">Back to Website</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

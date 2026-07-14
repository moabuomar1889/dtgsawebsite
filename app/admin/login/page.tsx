"use client";

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

const adminLoginSchema = z.object({
    email: z.email('Enter a valid email address'),
    password: z.string().optional(),
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [resetMessage, setResetMessage] = useState<string | null>(null);
    const [resetMode, setResetMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [resetCooldown, setResetCooldown] = useState(false);
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const {
        register,
        handleSubmit,
        clearErrors,
        formState: { errors },
    } = useForm<AdminLoginValues>({
        resolver: zodResolver(adminLoginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const handleLogin = async ({ email, password }: AdminLoginValues) => {
        setError(null);
        setResetMessage(null);

        if (!password) {
            setError('Enter your password');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
            } else {
                router.push('/admin');
                router.refresh();
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async ({ email }: AdminLoginValues) => {
        setError(null);
        setResetMessage(null);

        setResetLoading(true);

        try {
            const response = await fetch('/api/admin/password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            const payload = (await response.json()) as {
                ok?: boolean;
                message?: string;
            };

            if (!response.ok || !payload.ok) {
                setError(payload.message ?? 'The reset email could not be sent right now.');
            } else {
                setResetMessage(payload.message ?? 'If this email has admin access, a reset link has been sent.');
                setResetCooldown(true);
                window.setTimeout(() => setResetCooldown(false), 65000);
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="admin-theme min-h-screen bg-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-card-bg border border-border rounded-lg p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="flex flex-col items-center leading-tight">
                            <div className="text-3xl font-bold text-accent tracking-wide">
                                DURRAT<span>.</span>
                            </div>
                            <div className="text-xs tracking-[0.2em] text-accent/80 font-medium">
                                CONSTRUCTION
                            </div>
                        </div>
                        <p className="text-text-muted mt-4">Admin Login</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(resetMode ? handlePasswordReset : handleLogin)} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm" role="alert">
                                {error}
                            </div>
                        )}
                        {resetMessage && (
                            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm" role="status">
                                {resetMessage}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                {...register('email')}
                                required
                                className="w-full px-4 py-3 bg-bg border border-border rounded-lg focus:outline-none focus:border-accent text-text"
                                placeholder="admin@example.com"
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        {!resetMode && (
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        {...register('password')}
                                        required
                                        autoComplete="current-password"
                                        className="w-full rounded-lg border border-border bg-bg px-4 py-3 pr-12 text-text focus:border-accent focus:outline-none"
                                        placeholder="••••••••"
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
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || resetLoading || (resetMode && resetCooldown)}
                            className="w-full px-4 py-3 bg-accent text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resetMode
                                ? resetLoading
                                    ? 'Sending reset link...'
                                    : resetCooldown
                                        ? 'Wait before requesting again'
                                        : 'Send Reset Link'
                                : loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={() => {
                            setResetMode((value) => !value);
                            setError(null);
                            setResetMessage(null);
                            clearErrors();
                        }}
                        className="w-full mt-4 text-sm text-accent hover:underline"
                    >
                        {resetMode ? 'Back to sign in' : 'Forgot password?'}
                    </button>

                    <p className="text-center text-text-muted text-sm mt-6">
                        <Link href="/" className="text-accent hover:underline">
                            ← Back to Website
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

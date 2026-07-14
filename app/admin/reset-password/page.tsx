"use client";

import { useMemo, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ready, setReady] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        let isMounted = true;
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (!isMounted) return;
            if (event === 'PASSWORD_RECOVERY' && session) {
                setReady(true);
                setError(null);
            }
        });

        const checkSession = async () => {
            const hashParams = new URLSearchParams(window.location.hash.slice(1));
            const urlParams = new URLSearchParams(window.location.search);
            const authError = hashParams.get('error_description') || urlParams.get('error_description');
            const code = urlParams.get('code');
            const hashType = hashParams.get('type');
            const queryType = urlParams.get('type');
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            const tokenHash = urlParams.get('token_hash') || hashParams.get('token_hash');
            let hasRecoverySignal = hashType === 'recovery' || queryType === 'recovery';

            if (authError) {
                setError(authError);
                setReady(false);
                return;
            }

            if (accessToken && refreshToken) {
                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });
                if (error) {
                    setError(error.message);
                    setReady(false);
                    return;
                }
                hasRecoverySignal = true;
                window.history.replaceState(null, '', '/admin/reset-password');
            }

            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    setError(error.message);
                    setReady(false);
                    return;
                }
                hasRecoverySignal = true;
                window.history.replaceState(null, '', '/admin/reset-password');
            }

            if (tokenHash && (hashType === 'recovery' || queryType === 'recovery')) {
                const { error } = await supabase.auth.verifyOtp({
                    type: 'recovery',
                    token_hash: tokenHash,
                });

                if (error) {
                    setError(error.message);
                    setReady(false);
                    return;
                }
                hasRecoverySignal = true;
                window.history.replaceState(null, '', '/admin/reset-password');
            }

            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!isMounted) return;

            if (session && hasRecoverySignal) {
                setReady(true);
                setError(null);
            } else {
                setError('Invalid or expired recovery link. Please request a new one.');
                setReady(false);
            }
        };

        void checkSession();

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
            return;
        }

        if (!ready) {
            setError('Invalid or expired recovery link. Please request a new one.');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                setError(error.message);
            } else {
                await supabase.auth.signOut();
                setSuccess(true);
                setTimeout(() => {
                    router.push('/admin/login');
                }, 2000);
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="admin-theme min-h-screen bg-bg flex items-center justify-center p-4">
                <div className="bg-card-bg border border-border rounded-lg p-8 text-center max-w-md">
                    <div className="text-green-400 text-5xl mb-4">✓</div>
                    <h1 className="text-2xl font-bold text-text mb-2">Password Updated!</h1>
                    <p className="text-text-muted">Redirecting to sign in...</p>
                </div>
            </div>
        );
    }

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
                        <p className="text-text-muted mt-4">Set New Password</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm" role="alert">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={MIN_PASSWORD_LENGTH}
                                    autoComplete="new-password"
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

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={MIN_PASSWORD_LENGTH}
                                    autoComplete="new-password"
                                    className="w-full rounded-lg border border-border bg-bg px-4 py-3 pr-12 text-text focus:border-accent focus:outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((value) => !value)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted transition-colors hover:text-text"
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !ready}
                            className="w-full px-4 py-3 bg-accent text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>

                    <p className="text-center text-text-muted text-sm mt-6">
                        <Link href="/admin/login" className="text-accent hover:underline">
                            Back to sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

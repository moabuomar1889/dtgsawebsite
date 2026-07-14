"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    BriefcaseBusiness,
    Building2,
    ChevronsLeft,
    ChevronsRight,
    ExternalLink,
    ImageIcon,
    Images,
    LayoutDashboard,
    LogOut,
    Mail,
    Newspaper,
    Settings,
    Wrench,
    type LucideIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AdminLayoutProps {
    children: React.ReactNode;
}

interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
}

const navGroups: Array<{ label: string; items: NavItem[] }> = [
    {
        label: 'Workspace',
        items: [
            { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/admin/settings', label: 'Settings', icon: Settings },
        ],
    },
    {
        label: 'Content',
        items: [
            { href: '/admin/projects', label: 'Projects', icon: ImageIcon },
            { href: '/admin/media', label: 'Media', icon: Images },
            { href: '/admin/clients', label: 'Clients', icon: Building2 },
            { href: '/admin/services', label: 'Services', icon: Wrench },
            { href: '/admin/experience', label: 'Experience', icon: BriefcaseBusiness },
            { href: '/admin/news', label: 'News', icon: Newspaper },
            { href: '/admin/messages', label: 'Messages', icon: Mail },
        ],
    },
];

const navItems = navGroups.flatMap((group) => group.items);

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const activeItem = navItems.find((item) => {
        if (item.href === '/admin') {
            return pathname === item.href;
        }

        return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }) || navItems[0];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <div className="admin-theme flex h-screen overflow-hidden bg-bg text-text">
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card-bg transition-[width] duration-200 ${sidebarOpen ? 'w-64' : 'w-20'}`}
            >
                <div className="flex h-20 items-center border-b border-border px-5">
                    <Link href="/admin" className="min-w-0 leading-tight">
                        <div className={`font-bold tracking-wide text-accent ${sidebarOpen ? 'text-xl' : 'text-center text-lg'}`}>
                            {sidebarOpen ? 'DURRAT.' : 'D.'}
                        </div>
                        {sidebarOpen && (
                            <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-accent/80">
                                Admin Panel
                            </div>
                        )}
                    </Link>
                </div>

                <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
                    {navGroups.map((group) => (
                        <div key={group.label}>
                            {sidebarOpen && (
                                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                                    {group.label}
                                </p>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeItem.href === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${isActive
                                                ? 'bg-accent/10 text-accent'
                                                : 'text-text-muted hover:bg-border/35 hover:text-text'
                                                } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                                            aria-current={isActive ? 'page' : undefined}
                                            title={!sidebarOpen ? item.label : undefined}
                                        >
                                            <Icon className="h-5 w-5 shrink-0" />
                                            {sidebarOpen && <span className="truncate">{item.label}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-border p-3">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen((value) => !value)}
                        className={`mb-2 flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-text-muted transition-colors hover:bg-border/35 hover:text-text ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        {sidebarOpen ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
                        {sidebarOpen && <span>Collapse</span>}
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className={`mb-2 flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-red-300 transition-colors hover:bg-red-500/10 ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                    <Link
                        href="/"
                        target="_blank"
                        className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-text-muted transition-colors hover:bg-border/35 hover:text-text ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                        title="View site"
                    >
                        <ExternalLink className="h-5 w-5" />
                        {sidebarOpen && <span>View Site</span>}
                    </Link>
                </div>
            </aside>

            <main className={`flex h-full min-h-0 flex-1 flex-col overflow-hidden transition-[margin] duration-200 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="flex h-20 shrink-0 items-center justify-between border-b border-border bg-bg/95 px-6">
                    <div className="min-w-0">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Admin</p>
                        <h1 className="truncate text-xl font-bold text-text">{activeItem.label}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
                        >
                            <ExternalLink className="h-4 w-4" />
                            View Site
                        </Link>
                    </div>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    <div className="px-5 py-6 lg:px-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}

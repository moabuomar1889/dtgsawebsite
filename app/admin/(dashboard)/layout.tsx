import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminLayout from '@/components/admin/AdminLayout';

export default async function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/admin/login');
    }

    return <AdminLayout>{children}</AdminLayout>;
}

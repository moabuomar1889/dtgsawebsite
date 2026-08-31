import { redirect } from 'next/navigation';
import { getCurrentAdminUser } from '@/lib/auth/session';
import AdminLayout from '@/components/admin/AdminLayout';

export default async function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentAdminUser();

    if (!user) {
        redirect('/admin/login');
    }

    return <AdminLayout>{children}</AdminLayout>;
}

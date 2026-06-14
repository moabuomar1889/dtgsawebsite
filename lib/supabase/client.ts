import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    const schema = process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA;
    const options = schema && schema !== 'public' ? { db: { schema } } : undefined;

    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        options
    );
}

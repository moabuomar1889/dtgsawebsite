import type { PublicContentRepository } from '@/backend/repositories/public-content-repository';
import { createClient } from '@/lib/supabase/server';

export class SupabasePublicContentRepository implements PublicContentRepository {
    async loadSettings() {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }

    async loadClients() {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data;
    }

    async loadProjects() {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('projects')
            .select('*, client:clients(*)')
            .order('is_featured', { ascending: false })
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async loadNews() {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .eq('is_published', true)
            .order('date', { ascending: false })
            .limit(3);

        if (error) throw error;
        return data;
    }

    async loadExperience() {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('experience')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data;
    }

    async loadServices() {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data;
    }
}

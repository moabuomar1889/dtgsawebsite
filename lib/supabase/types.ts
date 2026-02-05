// Database Types for dtgsa-website schema

export interface Settings {
    id: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    hero_image_url: string | null;
    about_image_url: string | null;
    contact_bg_url: string | null;
    site_title: string;
    hero_headline: string;
    hero_subheadline: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    updated_at: string;
}

export interface Client {
    id: string;
    name: string;
    website_url: string | null;
    logo_url_bw: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    title: string;
    description?: string;
    year?: string;
    site?: string;
    duration?: string;
    image_url: string | null;
    gallery_urls: string[];
    client_id: string | null;
    is_featured: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    // Joined data
    client?: Client;
}

export interface News {
    id: string;
    title: string;
    date: string;
    excerpt: string;
    image_url: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface Experience {
    id: string;
    title: string;
    company: string;
    start_year: number;
    end_year: number | null;
    description: string;
    sort_order: number;
}

export interface Service {
    id: string;
    title: string;
    description: string;
    icon_key: string;
    icon_url?: string | null;
    sort_order: number;
}

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    created_at: string;
}

// Form types for CRUD operations
export type SettingsUpdate = Partial<Omit<Settings, 'id' | 'updated_at'>>;
export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'>;
export type ClientUpdate = Partial<ClientInsert>;
export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'client'>;
export type ProjectUpdate = Partial<ProjectInsert>;
export type NewsInsert = Omit<News, 'id' | 'created_at' | 'updated_at'>;
export type NewsUpdate = Partial<NewsInsert>;
export type ExperienceInsert = Omit<Experience, 'id'>;
export type ExperienceUpdate = Partial<ExperienceInsert>;
export type ServiceInsert = Omit<Service, 'id'>;
export type ServiceUpdate = Partial<ServiceInsert>;
export type ContactMessageInsert = Omit<ContactMessage, 'id' | 'created_at'>;

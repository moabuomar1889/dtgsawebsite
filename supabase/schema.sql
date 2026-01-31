-- ========================================
-- DURRAT Website - Complete Clean Setup
-- Schema: dtgsawebsite
-- ========================================

-- Drop old schemas
DROP SCHEMA IF EXISTS dtgsa_website CASCADE;
DROP SCHEMA IF EXISTS "dtgsa-website" CASCADE;
DROP SCHEMA IF EXISTS dtgsawebsite CASCADE;

-- Create fresh schema
CREATE SCHEMA dtgsawebsite;

-- Grant usage
GRANT USAGE ON SCHEMA dtgsawebsite TO anon, authenticated;

-- Create tables
CREATE TABLE dtgsawebsite.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accent_color VARCHAR(20) DEFAULT '#ef4444',
    background_color VARCHAR(20) DEFAULT '#161616',
    text_color VARCHAR(20) DEFAULT '#d7d7d7',
    hero_image_url TEXT,
    about_image_url TEXT,
    contact_bg_url TEXT,
    site_title VARCHAR(255) DEFAULT 'DURRAT Construction',
    hero_headline TEXT DEFAULT 'Excellence in Oil & Gas Construction',
    hero_subheadline TEXT DEFAULT 'Building world-class energy infrastructure with precision engineering, proven expertise, and unwavering commitment to safety and quality.',
    contact_email VARCHAR(255) DEFAULT 'info@durrat.com',
    contact_phone VARCHAR(50) DEFAULT '+966 123 456 789',
    contact_address TEXT DEFAULT 'Riyadh, Saudi Arabia',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dtgsawebsite.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    website_url TEXT,
    logo_url_bw TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dtgsawebsite.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    year VARCHAR(10),
    site TEXT,
    duration VARCHAR(100),
    image_url TEXT,
    client_id UUID REFERENCES dtgsawebsite.clients(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dtgsawebsite.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    excerpt TEXT,
    image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dtgsawebsite.experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    start_year INTEGER,
    end_year INTEGER,
    description TEXT,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE dtgsawebsite.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_key VARCHAR(50) DEFAULT 'wrench',
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE dtgsawebsite.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA dtgsawebsite TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA dtgsawebsite TO anon, authenticated;

-- Enable RLS
ALTER TABLE dtgsawebsite.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtgsawebsite.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtgsawebsite.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtgsawebsite.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtgsawebsite.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtgsawebsite.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtgsawebsite.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "settings_select" ON dtgsawebsite.settings FOR SELECT USING (true);
CREATE POLICY "settings_update" ON dtgsawebsite.settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "settings_insert" ON dtgsawebsite.settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "clients_select" ON dtgsawebsite.clients FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "clients_insert" ON dtgsawebsite.clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "clients_update" ON dtgsawebsite.clients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "clients_delete" ON dtgsawebsite.clients FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "projects_select" ON dtgsawebsite.projects FOR SELECT USING (true);
CREATE POLICY "projects_insert" ON dtgsawebsite.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "projects_update" ON dtgsawebsite.projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "projects_delete" ON dtgsawebsite.projects FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "news_select" ON dtgsawebsite.news FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "news_insert" ON dtgsawebsite.news FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "news_update" ON dtgsawebsite.news FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "news_delete" ON dtgsawebsite.news FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "experience_select" ON dtgsawebsite.experience FOR SELECT USING (true);
CREATE POLICY "experience_insert" ON dtgsawebsite.experience FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "experience_update" ON dtgsawebsite.experience FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "experience_delete" ON dtgsawebsite.experience FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "services_select" ON dtgsawebsite.services FOR SELECT USING (true);
CREATE POLICY "services_insert" ON dtgsawebsite.services FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "services_update" ON dtgsawebsite.services FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "services_delete" ON dtgsawebsite.services FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "messages_insert" ON dtgsawebsite.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_select" ON dtgsawebsite.contact_messages FOR SELECT USING (auth.role() = 'authenticated');

-- Seed data
INSERT INTO dtgsawebsite.settings (id) VALUES (gen_random_uuid());

INSERT INTO dtgsawebsite.services (title, description, icon_key, sort_order) VALUES
    ('Pipeline Construction', 'Expert pipeline installation for oil, gas, and water transmission systems', 'pipeline', 1),
    ('Platform Fabrication', 'Offshore platform design, fabrication, and installation services', 'platform', 2),
    ('EPC Projects', 'Full Engineering, Procurement, and Construction management', 'building', 3),
    ('Maintenance Services', 'Preventive and corrective maintenance for industrial facilities', 'wrench', 4);

INSERT INTO dtgsawebsite.experience (title, company, start_year, end_year, description, sort_order) VALUES
    ('Senior Project Manager', 'Saudi Aramco', 2018, NULL, 'Leading major offshore construction projects in the Arabian Gulf', 1),
    ('Construction Superintendent', 'SABIC', 2014, 2018, 'Supervised construction of petrochemical processing facilities', 2),
    ('Site Engineer', 'Petro Rabigh', 2010, 2014, 'Managed on-site engineering operations for refinery expansion', 3);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

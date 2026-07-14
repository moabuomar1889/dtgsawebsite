CREATE TABLE IF NOT EXISTS public.settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    accent_color varchar(20) DEFAULT '#ffbb00',
    background_color varchar(20) DEFAULT '#161616',
    text_color varchar(20) DEFAULT '#d7d7d7',
    hero_image_url text,
    about_image_url text,
    contact_bg_url text,
    site_title varchar(255) DEFAULT 'DURRAT Construction',
    hero_headline text DEFAULT 'Excellence in Oil & Gas Construction',
    hero_subheadline text DEFAULT 'Building world-class energy infrastructure with precision engineering, proven expertise, and unwavering commitment to safety and quality.',
    contact_email varchar(255) DEFAULT 'info@durrat.com',
    contact_phone varchar(50) DEFAULT '+966 123 456 789',
    contact_address text DEFAULT 'Riyadh, Saudi Arabia',
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    website_url text,
    logo_url_bw text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(255) NOT NULL,
    description text,
    year varchar(10),
    site text,
    duration varchar(100),
    image_url text,
    gallery_urls text[] DEFAULT '{}',
    client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
    is_featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.news (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(255) NOT NULL,
    date date DEFAULT current_date,
    excerpt text,
    image_url text,
    is_published boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.experience (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(255) NOT NULL,
    company varchar(255),
    start_year integer,
    end_year integer,
    description text,
    sort_order integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(255) NOT NULL,
    description text,
    icon_key varchar(50) DEFAULT 'wrench',
    icon_url text,
    sort_order integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    message text NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS icon_url text;

CREATE OR REPLACE FUNCTION public.is_dtgsa_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT
        COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
        OR lower(COALESCE(auth.jwt() ->> 'email', '')) = 'mo.abuomar@dtgsa.com'
$$;

GRANT SELECT, INSERT, UPDATE, DELETE ON
    public.settings,
    public.clients,
    public.projects,
    public.news,
    public.experience,
    public.services,
    public.contact_messages
TO anon, authenticated;

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_select" ON public.settings;
DROP POLICY IF EXISTS "settings_insert" ON public.settings;
DROP POLICY IF EXISTS "settings_update" ON public.settings;
DROP POLICY IF EXISTS "settings_delete" ON public.settings;
CREATE POLICY "settings_select" ON public.settings FOR SELECT USING (true);
CREATE POLICY "settings_insert" ON public.settings FOR INSERT WITH CHECK (public.is_dtgsa_admin());
CREATE POLICY "settings_update" ON public.settings FOR UPDATE USING (public.is_dtgsa_admin()) WITH CHECK (public.is_dtgsa_admin());
CREATE POLICY "settings_delete" ON public.settings FOR DELETE USING (public.is_dtgsa_admin());

DROP POLICY IF EXISTS "clients_select" ON public.clients;
DROP POLICY IF EXISTS "clients_insert" ON public.clients;
DROP POLICY IF EXISTS "clients_update" ON public.clients;
DROP POLICY IF EXISTS "clients_delete" ON public.clients;
CREATE POLICY "clients_select" ON public.clients FOR SELECT USING (is_active = true OR public.is_dtgsa_admin());
CREATE POLICY "clients_insert" ON public.clients FOR INSERT WITH CHECK (public.is_dtgsa_admin());
CREATE POLICY "clients_update" ON public.clients FOR UPDATE USING (public.is_dtgsa_admin()) WITH CHECK (public.is_dtgsa_admin());
CREATE POLICY "clients_delete" ON public.clients FOR DELETE USING (public.is_dtgsa_admin());

DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_update" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;
CREATE POLICY "projects_select" ON public.projects FOR SELECT USING (true);
CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (public.is_dtgsa_admin());
CREATE POLICY "projects_update" ON public.projects FOR UPDATE USING (public.is_dtgsa_admin()) WITH CHECK (public.is_dtgsa_admin());
CREATE POLICY "projects_delete" ON public.projects FOR DELETE USING (public.is_dtgsa_admin());

DROP POLICY IF EXISTS "news_select" ON public.news;
DROP POLICY IF EXISTS "news_insert" ON public.news;
DROP POLICY IF EXISTS "news_update" ON public.news;
DROP POLICY IF EXISTS "news_delete" ON public.news;
CREATE POLICY "news_select" ON public.news FOR SELECT USING (is_published = true OR public.is_dtgsa_admin());
CREATE POLICY "news_insert" ON public.news FOR INSERT WITH CHECK (public.is_dtgsa_admin());
CREATE POLICY "news_update" ON public.news FOR UPDATE USING (public.is_dtgsa_admin()) WITH CHECK (public.is_dtgsa_admin());
CREATE POLICY "news_delete" ON public.news FOR DELETE USING (public.is_dtgsa_admin());

DROP POLICY IF EXISTS "experience_select" ON public.experience;
DROP POLICY IF EXISTS "experience_insert" ON public.experience;
DROP POLICY IF EXISTS "experience_update" ON public.experience;
DROP POLICY IF EXISTS "experience_delete" ON public.experience;
CREATE POLICY "experience_select" ON public.experience FOR SELECT USING (true);
CREATE POLICY "experience_insert" ON public.experience FOR INSERT WITH CHECK (public.is_dtgsa_admin());
CREATE POLICY "experience_update" ON public.experience FOR UPDATE USING (public.is_dtgsa_admin()) WITH CHECK (public.is_dtgsa_admin());
CREATE POLICY "experience_delete" ON public.experience FOR DELETE USING (public.is_dtgsa_admin());

DROP POLICY IF EXISTS "services_select" ON public.services;
DROP POLICY IF EXISTS "services_insert" ON public.services;
DROP POLICY IF EXISTS "services_update" ON public.services;
DROP POLICY IF EXISTS "services_delete" ON public.services;
CREATE POLICY "services_select" ON public.services FOR SELECT USING (true);
CREATE POLICY "services_insert" ON public.services FOR INSERT WITH CHECK (public.is_dtgsa_admin());
CREATE POLICY "services_update" ON public.services FOR UPDATE USING (public.is_dtgsa_admin()) WITH CHECK (public.is_dtgsa_admin());
CREATE POLICY "services_delete" ON public.services FOR DELETE USING (public.is_dtgsa_admin());

DROP POLICY IF EXISTS "messages_insert" ON public.contact_messages;
DROP POLICY IF EXISTS "messages_select" ON public.contact_messages;
DROP POLICY IF EXISTS "messages_update" ON public.contact_messages;
DROP POLICY IF EXISTS "messages_delete" ON public.contact_messages;
CREATE POLICY "messages_insert" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_select" ON public.contact_messages FOR SELECT USING (public.is_dtgsa_admin());
CREATE POLICY "messages_update" ON public.contact_messages FOR UPDATE USING (public.is_dtgsa_admin()) WITH CHECK (public.is_dtgsa_admin());
CREATE POLICY "messages_delete" ON public.contact_messages FOR DELETE USING (public.is_dtgsa_admin());

INSERT INTO public.settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

INSERT INTO public.services (title, description, icon_key, sort_order)
SELECT *
FROM (
    VALUES
        ('Pipeline Construction', 'Expert pipeline installation for oil, gas, and water transmission systems', 'pipeline', 1),
        ('Platform Fabrication', 'Offshore platform design, fabrication, and installation services', 'platform', 2),
        ('EPC Projects', 'Full Engineering, Procurement, and Construction management', 'building', 3),
        ('Maintenance Services', 'Preventive and corrective maintenance for industrial facilities', 'wrench', 4)
) AS seed(title, description, icon_key, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.services);

INSERT INTO public.experience (title, company, start_year, end_year, description, sort_order)
SELECT *
FROM (
    VALUES
        ('Senior Project Manager', 'Saudi Aramco', 2018, NULL::integer, 'Leading major offshore construction projects in the Arabian Gulf', 1),
        ('Construction Superintendent', 'SABIC', 2014, 2018, 'Supervised construction of petrochemical processing facilities', 2),
        ('Site Engineer', 'Petro Rabigh', 2010, 2014, 'Managed on-site engineering operations for refinery expansion', 3)
) AS seed(title, company, start_year, end_year, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.experience);

NOTIFY pgrst, 'reload schema';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'dtgsa-website-assets',
    'dtgsa-website-assets',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE OR REPLACE FUNCTION public.is_dtgsa_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
    SELECT
        COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
        OR lower(COALESCE(auth.jwt() ->> 'email', '')) = 'mo.abuomar@dtgsa.com'
$$;

DROP POLICY IF EXISTS "dtgsa_assets_public_select" ON storage.objects;
DROP POLICY IF EXISTS "dtgsa_assets_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "dtgsa_assets_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "dtgsa_assets_admin_delete" ON storage.objects;

CREATE POLICY "dtgsa_assets_public_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'dtgsa-website-assets');

CREATE POLICY "dtgsa_assets_admin_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dtgsa-website-assets' AND public.is_dtgsa_admin());

CREATE POLICY "dtgsa_assets_admin_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'dtgsa-website-assets' AND public.is_dtgsa_admin())
WITH CHECK (bucket_id = 'dtgsa-website-assets' AND public.is_dtgsa_admin());

CREATE POLICY "dtgsa_assets_admin_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'dtgsa-website-assets' AND public.is_dtgsa_admin());

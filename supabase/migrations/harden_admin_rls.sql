DO $$
DECLARE
    target_schema text;
    admin_predicate text;
BEGIN
    SELECT schema_name
    INTO target_schema
    FROM information_schema.schemata
    WHERE schema_name IN ('public', 'dtgsawebsite')
    ORDER BY CASE schema_name WHEN 'public' THEN 0 ELSE 1 END
    LIMIT 1;

    IF target_schema IS NULL THEN
        RAISE NOTICE 'No supported website schema found; skipping CMS RLS hardening.';
        RETURN;
    END IF;

    EXECUTE format(
        'CREATE OR REPLACE FUNCTION %I.is_admin()
         RETURNS BOOLEAN
         LANGUAGE SQL
         STABLE
         AS $fn$
             SELECT
                 COALESCE(auth.jwt() -> ''app_metadata'' ->> ''role'', '''') = ''admin''
                 OR lower(COALESCE(auth.jwt() ->> ''email'', '''')) = ''mo.abuomar@dtgsa.com''
         $fn$',
        target_schema
    );

    admin_predicate := format('%I.is_admin()', target_schema);

    IF to_regclass(format('%I.settings', target_schema)) IS NOT NULL THEN
        EXECUTE format('DROP POLICY IF EXISTS "settings_update" ON %I.settings', target_schema);
        EXECUTE format('DROP POLICY IF EXISTS "settings_insert" ON %I.settings', target_schema);
        EXECUTE format('CREATE POLICY "settings_update" ON %I.settings FOR UPDATE USING (%s)', target_schema, admin_predicate);
        EXECUTE format('CREATE POLICY "settings_insert" ON %I.settings FOR INSERT WITH CHECK (%s)', target_schema, admin_predicate);
    END IF;

    IF to_regclass(format('%I.clients', target_schema)) IS NOT NULL THEN
        EXECUTE format('DROP POLICY IF EXISTS "clients_select" ON %I.clients', target_schema);
        EXECUTE format('DROP POLICY IF EXISTS "clients_insert" ON %I.clients', target_schema);
        EXECUTE format('DROP POLICY IF EXISTS "clients_update" ON %I.clients', target_schema);
        EXECUTE format('DROP POLICY IF EXISTS "clients_delete" ON %I.clients', target_schema);
        EXECUTE format('CREATE POLICY "clients_select" ON %I.clients FOR SELECT USING (is_active = true OR %s)', target_schema, admin_predicate);
        EXECUTE format('CREATE POLICY "clients_insert" ON %I.clients FOR INSERT WITH CHECK (%s)', target_schema, admin_predicate);
        EXECUTE format('CREATE POLICY "clients_update" ON %I.clients FOR UPDATE USING (%s)', target_schema, admin_predicate);
        EXECUTE format('CREATE POLICY "clients_delete" ON %I.clients FOR DELETE USING (%s)', target_schema, admin_predicate);
    END IF;

    IF to_regclass(format('%I.projects', target_schema)) IS NOT NULL THEN
        EXECUTE format('DROP POLICY IF EXISTS "projects_insert" ON %I.projects', target_schema);
        EXECUTE format('DROP POLICY IF EXISTS "projects_update" ON %I.projects', target_schema);
        EXECUTE format('DROP POLICY IF EXISTS "projects_delete" ON %I.projects', target_schema);
        EXECUTE format('CREATE POLICY "projects_insert" ON %I.projects FOR INSERT WITH CHECK (%s)', target_schema, admin_predicate);
        EXECUTE format('CREATE POLICY "projects_update" ON %I.projects FOR UPDATE USING (%s)', target_schema, admin_predicate);
        EXECUTE format('CREATE POLICY "projects_delete" ON %I.projects FOR DELETE USING (%s)', target_schema, admin_predicate);
    END IF;

    IF to_regclass(format('%I.news', target_schema)) IS NOT NULL THEN
        EXECUTE format('DROP POLICY IF EXISTS "news_select" ON %I.news', target_schema);
        EXECUTE format('DROP POLICY IF EXISTS "news_insert" ON %I.news', target_schema);
        EXECUTE format('DROP POLICY IF EXISTS "news_update" ON %I.news', target_schema);
        EXECUTE format('DROP POLICY IF EXISTS "news_delete" ON %I.news', target_schema);
        EXECUTE format('CREATE POLICY "news_select" ON %I.news FOR SELECT USING (is_published = true OR %s)', target_schema, admin_predicate);
        EXECUTE format('CREATE POLICY "news_insert" ON %I.news FOR INSERT WITH CHECK (%s)', target_schema, admin_predicate);
        EXECUTE format('CREATE POLICY "news_update" ON %I.news FOR UPDATE USING (%s)', target_schema, admin_predicate);
        EXECUTE format('CREATE POLICY "news_delete" ON %I.news FOR DELETE USING (%s)', target_schema, admin_predicate);
    END IF;

    IF to_regclass(format('%I.experience', target_schema)) IS NOT NULL THEN
        EXECUTE format('DROP POLICY IF EXISTS "experience_insert" ON %I.experience', target_schema);
        EXECUTE format('DROP POLICY IF EXISTS "experience_update" ON %I.experience', target_schema);
        EXECUTE format('DROP POLICY IF EXISTS "experience_delete" ON %I.experience', target_schema);
        EXECUTE format('CREATE POLICY "experience_insert" ON %I.experience FOR INSERT WITH CHECK (%s)', target_schema, admin_predicate);
        EXECUTE format('CREATE POLICY "experience_update" ON %I.experience FOR UPDATE USING (%s)', target_schema, admin_predicate);
        EXECUTE format('CREATE POLICY "experience_delete" ON %I.experience FOR DELETE USING (%s)', target_schema, admin_predicate);
    END IF;

    IF to_regclass(format('%I.services', target_schema)) IS NOT NULL THEN
        EXECUTE format('DROP POLICY IF EXISTS "services_insert" ON %I.services', target_schema);
        EXECUTE format('DROP POLICY IF EXISTS "services_update" ON %I.services', target_schema);
        EXECUTE format('DROP POLICY IF EXISTS "services_delete" ON %I.services', target_schema);
        EXECUTE format('CREATE POLICY "services_insert" ON %I.services FOR INSERT WITH CHECK (%s)', target_schema, admin_predicate);
        EXECUTE format('CREATE POLICY "services_update" ON %I.services FOR UPDATE USING (%s)', target_schema, admin_predicate);
        EXECUTE format('CREATE POLICY "services_delete" ON %I.services FOR DELETE USING (%s)', target_schema, admin_predicate);
    END IF;

    IF to_regclass(format('%I.contact_messages', target_schema)) IS NOT NULL THEN
        EXECUTE format('DROP POLICY IF EXISTS "messages_select" ON %I.contact_messages', target_schema);
        EXECUTE format('CREATE POLICY "messages_select" ON %I.contact_messages FOR SELECT USING (%s)', target_schema, admin_predicate);
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';

-- ========================================
-- MIGRATION: Add gallery_urls to projects
-- Schema: dtgsawebsite
-- ========================================

-- Add gallery_urls column for multi-image support (10+ images)
ALTER TABLE dtgsawebsite.projects
ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}';

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

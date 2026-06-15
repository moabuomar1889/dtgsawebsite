import { getPublicSettings } from '@/lib/data-fetching';
import { normalizeHexColor } from '@/lib/theme-colors';
import HomePageClient from './HomePageClient';

// Disable caching - always fetch fresh settings
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch settings server-side
  const settings = await getPublicSettings();
  const accentColor = normalizeHexColor(settings.accent_color);

  return (
    <>
      {/* Apply accent color from DB as CSS variable */}
      <style dangerouslySetInnerHTML={{
        __html: `:root { --color-accent: ${accentColor}; }`
      }} />
      <HomePageClient />
    </>
  );
}

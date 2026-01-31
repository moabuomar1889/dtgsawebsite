import { getPublicSettings } from '@/lib/data-fetching';
import HomePageClient from './HomePageClient';

// Disable caching - always fetch fresh settings
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch settings server-side
  const settings = await getPublicSettings();

  return (
    <>
      {/* Apply accent color from DB as CSS variable */}
      <style dangerouslySetInnerHTML={{
        __html: `:root { --color-accent: ${settings.accent_color || '#ef4444'}; }`
      }} />
      <HomePageClient />
    </>
  );
}

import { getPublicContentService } from '@/backend/config/public-content';
import { normalizeAssetUrl } from '@/lib/asset-url';
import { fallbackSettings } from '@/lib/fallback-data';
import { normalizeHexColor } from '@/lib/theme-colors';
import HomePageClient from './HomePageClient';

// Disable caching - always fetch fresh settings
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch settings server-side
  const settings = await getPublicContentService().getSettings();
  const accentColor = normalizeHexColor(settings.accent_color);
  const contactDetails = {
    email: settings.contact_email ?? fallbackSettings.contact_email,
    phone: settings.contact_phone ?? fallbackSettings.contact_phone,
    address: settings.contact_address ?? fallbackSettings.contact_address,
  };
  const heroImageUrl = normalizeAssetUrl(settings.hero_image_url)
    ?? fallbackSettings.hero_image_url;

  return (
    <>
      {/* Apply accent color from DB as CSS variable */}
      <style dangerouslySetInnerHTML={{
        __html: `:root { --color-accent: ${accentColor}; }`
      }} />
      <HomePageClient
        contactDetails={contactDetails}
        heroImageUrl={heroImageUrl}
      />
    </>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '@/lib/actions';
import type { Settings } from '@/lib/supabase/types';
import ImageUpload from '@/components/admin/ImageUpload';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form state
    const [accentColor, setAccentColor] = useState('#ef4444');
    const [siteTitle, setSiteTitle] = useState('');
    const [heroHeadline, setHeroHeadline] = useState('');
    const [heroSubheadline, setHeroSubheadline] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactAddress, setContactAddress] = useState('');
    const [heroImageUrl, setHeroImageUrl] = useState('');
    const [aboutImageUrl, setAboutImageUrl] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const data = await getSettings();
        if (data) {
            setSettings(data);
            setAccentColor(data.accent_color);
            setSiteTitle(data.site_title);
            setHeroHeadline(data.hero_headline);
            setHeroSubheadline(data.hero_subheadline);
            setContactEmail(data.contact_email);
            setContactPhone(data.contact_phone);
            setContactAddress(data.contact_address);
            setHeroImageUrl(data.hero_image_url || '');
            setAboutImageUrl(data.about_image_url || '');
        }
        setLoading(false);
    };

    // Apply accent color to CSS variables immediately (optimistic update)
    useEffect(() => {
        document.documentElement.style.setProperty('--color-accent', accentColor);
    }, [accentColor]);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        const result = await updateSettings({
            accent_color: accentColor,
            site_title: siteTitle,
            hero_headline: heroHeadline,
            hero_subheadline: heroSubheadline,
            contact_email: contactEmail,
            contact_phone: contactPhone,
            contact_address: contactAddress,
            hero_image_url: heroImageUrl || null,
            about_image_url: aboutImageUrl || null,
        });

        if (result.success) {
            setMessage({ type: 'success', text: 'Settings saved successfully!' });
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to save settings' });
        }

        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-text-muted">Loading settings...</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-text mb-8">Site Settings</h1>

            {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Theme Settings */}
                <div className="bg-card-bg border border-border rounded-lg p-6">
                    <h2 className="text-xl font-bold text-text mb-6">Theme</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-2">
                                Accent Color
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    className="w-16 h-12 rounded cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    className="flex-1 px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                                />
                            </div>
                            <p className="text-xs text-text-muted mt-2">
                                Changes preview instantly. Click Save to persist.
                            </p>
                        </div>

                        {/* Preview */}
                        <div className="mt-6 p-4 bg-bg rounded-lg border border-border">
                            <p className="text-sm text-text-muted mb-2">Preview:</p>
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-8 h-8 rounded-full"
                                    style={{ backgroundColor: accentColor }}
                                />
                                <span className="font-bold" style={{ color: accentColor }}>
                                    DURRAT.
                                </span>
                                <button
                                    className="px-4 py-2 text-white text-sm rounded"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    Button
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Background */}
                <div className="bg-card-bg border border-border rounded-lg p-6">
                    <h2 className="text-xl font-bold text-text mb-6">Hero Background</h2>

                    <ImageUpload
                        currentUrl={heroImageUrl}
                        onUpload={setHeroImageUrl}
                        folder="settings"
                        label="Background Image"
                        aspectRatio="16/9"
                        minWidth={1920}
                        minHeight={1080}
                        recommendedDimensions="1920×1080px (Full HD)"
                    />
                    <p className="text-xs text-text-muted mt-2">
                        This image appears behind the hero section on the homepage.
                    </p>
                </div>

                {/* About Section Background */}
                <div className="bg-card-bg border border-border rounded-lg p-6">
                    <h2 className="text-xl font-bold text-text mb-6">About Section Background</h2>

                    <ImageUpload
                        currentUrl={aboutImageUrl}
                        onUpload={setAboutImageUrl}
                        folder="settings"
                        label="About Background Image"
                        aspectRatio="4/3"
                        minWidth={800}
                        minHeight={600}
                        recommendedDimensions="800×600px or larger"
                    />
                    <p className="text-xs text-text-muted mt-2">
                        This image appears in the About section of the homepage.
                    </p>
                </div>

                {/* Site Info */}
                <div className="bg-card-bg border border-border rounded-lg p-6">
                    <h2 className="text-xl font-bold text-text mb-6">Site Info</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-2">
                                Site Title
                            </label>
                            <input
                                type="text"
                                value={siteTitle}
                                onChange={(e) => setSiteTitle(e.target.value)}
                                className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text mb-2">
                                Hero Headline
                            </label>
                            <input
                                type="text"
                                value={heroHeadline}
                                onChange={(e) => setHeroHeadline(e.target.value)}
                                className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text mb-2">
                                Hero Subheadline
                            </label>
                            <textarea
                                value={heroSubheadline}
                                onChange={(e) => setHeroSubheadline(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-card-bg border border-border rounded-lg p-6 lg:col-span-2">
                    <h2 className="text-xl font-bold text-text mb-6">Contact Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text mb-2">
                                Phone
                            </label>
                            <input
                                type="text"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text mb-2">
                                Address
                            </label>
                            <input
                                type="text"
                                value={contactAddress}
                                onChange={(e) => setContactAddress(e.target.value)}
                                className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}

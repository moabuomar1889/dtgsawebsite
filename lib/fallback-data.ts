// Fallback data used when database is empty or unavailable
// This ensures the site looks complete even without DB connection

export const fallbackSettings = {
    accent_color: '#ef4444',
    background_color: '#161616',
    text_color: '#d7d7d7',
    hero_image_url: '/placeholders/hero-bg.jpg',
    contact_bg_url: null,
    site_title: 'DURRAT Construction',
    hero_headline: 'Excellence in Oil & Gas Construction',
    hero_subheadline: 'Building world-class energy infrastructure with precision engineering, proven expertise, and unwavering commitment to safety and quality.',
    contact_email: 'info@durrat.com',
    contact_phone: '+966 123 456 789',
    contact_address: 'Riyadh, Saudi Arabia',
};

export const fallbackClients = [
    { id: '1', name: 'Saudi Aramco', logo_url_bw: null, website_url: null, sort_order: 1, is_active: true },
    { id: '2', name: 'SABIC', logo_url_bw: null, website_url: null, sort_order: 2, is_active: true },
    { id: '3', name: 'Saudi Electricity Company', logo_url_bw: null, website_url: null, sort_order: 3, is_active: true },
    { id: '4', name: 'ACWA Power', logo_url_bw: null, website_url: null, sort_order: 4, is_active: true },
    { id: '5', name: 'Maaden', logo_url_bw: null, website_url: null, sort_order: 5, is_active: true },
    { id: '6', name: 'Petro Rabigh', logo_url_bw: null, website_url: null, sort_order: 6, is_active: true },
];

export const fallbackProjects = [
    { id: '1', title: 'Offshore Platform Alpha', year: '2023', site: 'Arabian Gulf', duration: '18 months', image_url: '/placeholders/project-1.jpg', is_featured: true, sort_order: 1 },
    { id: '2', title: 'Riyadh Refinery Expansion', year: '2022', site: 'Riyadh', duration: '24 months', image_url: '/placeholders/project-2.jpg', is_featured: true, sort_order: 2 },
    { id: '3', title: 'Gas Pipeline Network', year: '2021', site: 'Eastern Province', duration: '12 months', image_url: '/placeholders/project-3.jpg', is_featured: true, sort_order: 3 },
];

export const fallbackNews = [
    { id: '1', title: 'DURRAT Wins Major Contract', date: '2024-01-15', excerpt: 'We are proud to announce winning the contract for the new offshore development project.', image_url: '/placeholders/news-1.jpg', is_published: true },
    { id: '2', title: 'Safety Excellence Award', date: '2024-01-10', excerpt: 'DURRAT Construction receives the annual safety excellence award for zero incidents.', image_url: '/placeholders/news-2.jpg', is_published: true },
    { id: '3', title: 'New Partnership Announcement', date: '2024-01-05', excerpt: 'Strategic partnership formed with leading international engineering firm.', image_url: '/placeholders/news-3.jpg', is_published: true },
];

export const fallbackExperience = [
    { id: '1', title: 'Senior Project Manager', company: 'Saudi Aramco', start_year: 2018, end_year: null, description: 'Leading major offshore construction projects in the Arabian Gulf', sort_order: 1 },
    { id: '2', title: 'Construction Superintendent', company: 'SABIC', start_year: 2014, end_year: 2018, description: 'Supervised construction of petrochemical processing facilities', sort_order: 2 },
    { id: '3', title: 'Site Engineer', company: 'Petro Rabigh', start_year: 2010, end_year: 2014, description: 'Managed on-site engineering operations for refinery expansion', sort_order: 3 },
];

export const fallbackServices = [
    { id: '1', title: 'Pipeline Construction', description: 'Expert pipeline installation for oil, gas, and water transmission systems', icon_key: 'pipeline', sort_order: 1 },
    { id: '2', title: 'Platform Fabrication', description: 'Offshore platform design, fabrication, and installation services', icon_key: 'platform', sort_order: 2 },
    { id: '3', title: 'EPC Projects', description: 'Full Engineering, Procurement, and Construction management', icon_key: 'building', sort_order: 3 },
    { id: '4', title: 'Maintenance Services', description: 'Preventive and corrective maintenance for industrial facilities', icon_key: 'wrench', sort_order: 4 },
];

// Skills for the Experience section (static for now)
export const skills = [
    { name: 'Pipeline Construction', percentage: 95 },
    { name: 'Structural Engineering', percentage: 90 },
    { name: 'Project Management', percentage: 85 },
    { name: 'Safety Compliance', percentage: 98 },
];

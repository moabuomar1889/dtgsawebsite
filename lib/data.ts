// Mock data structured to match future Supabase schema (Durrat Construction)

export interface Project {
    id: string;
    title: string;
    description: string;
    excerpt: string;
    image: string;
    category: string;
    featured: boolean;
}

export interface Client {
    id: string;
    name: string;
    logo: string;
}

export interface NewsArticle {
    id: string;
    title: string;
    excerpt: string;
    image: string;
    date: string;
}

export interface Experience {
    id: string;
    title: string;
    company: string;
    period: string;
    description: string;
}

export interface Capability {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export interface SocialLink {
    platform: string;
    url: string;
    icon: string;
}

export interface Skill {
    id: string;
    name: string;
    percentage: number;
}

// Skills data (editable from admin)
export const skills: Skill[] = [
    { id: '1', name: 'Offshore Construction', percentage: 95 },
    { id: '2', name: 'Pipeline Installation', percentage: 90 },
    { id: '3', name: 'Facility Construction', percentage: 85 },
    { id: '4', name: 'Project Management', percentage: 88 },
];

// Years of experience - DYNAMIC CALCULATION
// Base: 24 years in 2026, +1 each year starting 2027
const BASE_YEARS = 24;
const BASE_YEAR = 2026;

/**
 * Calculate years of experience dynamically
 * 2026 => 24, 2027 => 25, 2028 => 26, etc.
 * Call this at render time, not module load time
 */
export function getYearsOfExperience(): number {
    const currentYear = new Date().getFullYear();
    return BASE_YEARS + Math.max(0, currentYear - BASE_YEAR);
}

// Social links
export const socialLinks: SocialLink[] = [
    { platform: 'Facebook', url: 'https://facebook.com', icon: 'facebook' },
    { platform: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
    { platform: 'Instagram', url: 'https://instagram.com', icon: 'instagram' },
];

// Navigation items
export const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Experience', href: '#experience' },
    { label: 'Services', href: '#services' },
    { label: 'Projects', href: '#projects' },
    { label: 'Clients', href: '#clients' },
    { label: 'News', href: '#news' },
    { label: 'Contact', href: '#contact' },
];

// Projects data - Oil & Gas Construction Projects
export const projects: Project[] = [
    {
        id: '1',
        title: 'Offshore Platform Installation',
        description: 'Complete installation and commissioning of offshore oil platform including structural fabrication and mechanical systems.',
        excerpt: 'Major offshore platform installation in the Arabian Gulf.',
        image: '/placeholders/project-1.jpg',
        category: 'Offshore',
        featured: true,
    },
    {
        id: '2',
        title: 'Gas Processing Facility',
        description: 'Construction of state-of-the-art gas processing facility with advanced separation and treatment systems.',
        excerpt: 'Advanced gas processing infrastructure development.',
        image: '/placeholders/project-2.jpg',
        category: 'Gas Processing',
        featured: true,
    },
    {
        id: '3',
        title: 'Pipeline Network Expansion',
        description: '250km pipeline installation project connecting multiple oil fields to central processing facility.',
        excerpt: 'Large-scale pipeline infrastructure project.',
        image: '/placeholders/project-3.jpg',
        category: 'Pipeline',
        featured: false,
    },
    {
        id: '4',
        title: 'Refinery Modernization',
        description: 'Complete overhaul and modernization of existing refinery facilities to meet new environmental standards.',
        excerpt: 'Refinery upgrade and environmental compliance project.',
        image: '/placeholders/project-4.jpg',
        category: 'Refinery',
        featured: true,
    },
    {
        id: '5',
        title: 'Storage Tank Farm',
        description: 'Construction of crude oil storage facility with 12 tanks totaling 2 million barrel capacity.',
        excerpt: 'Major storage infrastructure development.',
        image: '/placeholders/project-5.jpg',
        category: 'Storage',
        featured: false,
    },
    {
        id: '6',
        title: 'Subsea Pipeline Installation',
        description: 'Deepwater pipeline installation using advanced subsea construction techniques.',
        excerpt: 'Cutting-edge subsea infrastructure project.',
        image: '/placeholders/project-6.jpg',
        category: 'Subsea',
        featured: false,
    },
    {
        id: '7',
        title: 'Compressor Station',
        description: 'Design and construction of gas compressor station for pipeline transmission system.',
        excerpt: 'Critical gas transmission infrastructure.',
        image: '/placeholders/project-7.jpg',
        category: 'Facilities',
        featured: true,
    },
    {
        id: '8',
        title: 'Onshore Production Facility',
        description: 'Integrated onshore oil production facility with separation, treatment, and export systems.',
        excerpt: 'Complete onshore production infrastructure.',
        image: '/placeholders/project-8.jpg',
        category: 'Onshore',
        featured: false,
    },
];

// Clients data - Oil & Gas Industry Partners
export const clients: Client[] = [
    { id: '1', name: 'Saudi Aramco', logo: '/placeholders/client-1.svg' },
    { id: '2', name: 'ADNOC', logo: '/placeholders/client-2.svg' },
    { id: '3', name: 'Qatar Petroleum', logo: '/placeholders/client-3.svg' },
    { id: '4', name: 'Kuwait Oil Company', logo: '/placeholders/client-4.svg' },
    { id: '5', name: 'Shell', logo: '/placeholders/client-5.svg' },
    { id: '6', name: 'TotalEnergies', logo: '/placeholders/client-6.svg' },
    { id: '7', name: 'Chevron', logo: '/placeholders/client-7.svg' },
    { id: '8', name: 'BP', logo: '/placeholders/client-8.svg' },
    { id: '9', name: 'ExxonMobil', logo: '/placeholders/client-9.svg' },
    { id: '10', name: 'Eni', logo: '/placeholders/client-10.svg' },
    { id: '11', name: 'Equinor', logo: '/placeholders/client-11.svg' },
    { id: '12', name: 'Petrobras', logo: '/placeholders/client-12.svg' },
];

// News articles - Industry Updates
export const newsArticles: NewsArticle[] = [
    {
        id: '1',
        title: 'Durrat Completes Major Offshore Platform Project',
        excerpt: 'Successfully delivered and commissioned offshore production platform ahead of schedule, setting new industry benchmarks.',
        image: '/placeholders/news-1.jpg',
        date: '2024-01-15',
    },
    {
        id: '2',
        title: 'New Safety Milestone Achieved',
        excerpt: 'Durrat Construction celebrates 10 million man-hours without Lost Time Incident across all active projects.',
        image: '/placeholders/news-2.jpg',
        date: '2024-01-10',
    },
    {
        id: '3',
        title: 'Partnership with Leading Technology Provider',
        excerpt: 'Strategic partnership announced to implement advanced digital construction management systems.',
        image: '/placeholders/news-3.jpg',
        date: '2024-01-05',
    },
    {
        id: '4',
        title: 'Expansion into Renewable Energy Sector',
        excerpt: 'Leveraging oil & gas expertise to deliver hydrogen production and carbon capture projects.',
        image: '/placeholders/news-4.jpg',
        date: '2023-12-28',
    },
];

// Experience timeline - Company History
export const experiences: Experience[] = [
    {
        id: '1',
        title: 'Major Offshore Contractor',
        company: 'Multiple Projects',
        period: '2020 - Present',
        description: 'Leading offshore platform installations and subsea infrastructure projects across the Arabian Gulf region.',
    },
    {
        id: '2',
        title: 'Gas Infrastructure Specialist',
        company: 'Regional Expansion',
        period: '2017 - 2020',
        description: 'Expanded into gas processing, LNG facilities, and pipeline construction for major energy companies.',
    },
    {
        id: '3',
        title: 'Refinery & Petrochemical',
        company: 'Downstream Focus',
        period: '2015 - 2017',
        description: 'Delivered refinery modernization and petrochemical plant construction projects.',
    },
    {
        id: '4',
        title: 'Onshore Production',
        company: 'Company Founded',
        period: '2012 - 2015',
        description: 'Established reputation in onshore oil and gas production facility construction.',
    },
];

// Services/Capabilities - Construction Services
export const capabilities: Capability[] = [
    {
        id: '1',
        title: 'Offshore Construction',
        description: 'Platform installation, subsea pipelines, and marine construction services for offshore oil & gas facilities.',
        icon: 'offshore',
    },
    {
        id: '2',
        title: 'Pipeline Installation',
        description: 'Complete pipeline construction from design through commissioning, including onshore and offshore systems.',
        icon: 'pipeline',
    },
    {
        id: '3',
        title: 'Facility Construction',
        description: 'Oil & gas processing facilities, refineries, and petrochemical plants built to international standards.',
        icon: 'facility',
    },
    {
        id: '4',
        title: 'Project Management',
        description: 'Comprehensive EPC (Engineering, Procurement, Construction) project management and execution.',
        icon: 'management',
    },
    {
        id: '5',
        title: 'Safety & QA/QC',
        description: 'Industry-leading safety programs and quality assurance/quality control processes.',
        icon: 'safety',
    },
    {
        id: '6',
        title: 'Commissioning',
        description: 'Pre-commissioning, commissioning, and startup services for oil & gas facilities.',
        icon: 'commissioning',
    },
];

// Contact information
export const contactInfo = {
    phone: '+966 (0) 123 456 789',
    email: 'info@durratconstruction.com',
    address: 'Riyadh, Saudi Arabia',
    tagline: 'Building the energy infrastructure of tomorrow',
};

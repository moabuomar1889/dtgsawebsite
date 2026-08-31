"use client";

import { useState } from 'react';
import TopNav from '@/components/layout/TopNav';
import FullpageWrapper from '@/components/layout/FullpageWrapper';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Experience from '@/components/sections/Experience';
import Services from '@/components/sections/Services';
import Clients from '@/components/sections/Clients';
import Contact, { type ContactDetails } from '@/components/sections/Contact';

interface HomePageClientProps {
    contactDetails: ContactDetails;
    heroImageUrl: string;
}

export default function HomePageClient({ contactDetails, heroImageUrl }: HomePageClientProps) {
    const [activeSection, setActiveSection] = useState('home');
    const sections = [
        { id: 'home', name: 'Home', component: <Hero heroImageUrl={heroImageUrl} /> },
        { id: 'about', name: 'About', component: <About /> },
        { id: 'experience', name: 'Experience', component: <Experience /> },
        { id: 'services', name: 'Services', component: <Services /> },
        { id: 'clients', name: 'Clients', component: <Clients /> },
        { id: 'contact', name: 'Contact', component: <Contact contactDetails={contactDetails} /> },
    ];

    const handleSectionChange = (sectionId: string) => {
        setActiveSection(sectionId);
    };

    return (
        <div className="relative bg-bg">
            {/* Fixed UI Elements */}
            <TopNav
                activeSection={activeSection}
                phone={contactDetails.phone}
            />

            {/* Fullpage Sections */}
            <FullpageWrapper
                sections={sections}
                onSectionChange={handleSectionChange}
            />

            {/* Footer - fixed at bottom like Gilber */}
            <footer className="fixed bottom-0 left-0 right-0 z-30 py-4 px-6">
                <div className="flex justify-between items-center text-xs text-text-muted">
                    <div>
                        © DURRAT<span className="text-accent">.</span> {new Date().getFullYear()}
                    </div>
                </div>
            </footer>
        </div>
    );
}

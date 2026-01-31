"use client";

import { useState } from 'react';
import LeftSidebar from '@/components/layout/LeftSidebar';
import TopNav from '@/components/layout/TopNav';
import FullpageWrapper from '@/components/layout/FullpageWrapper';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Experience from '@/components/sections/Experience';
import Services from '@/components/sections/Workforce';
import Projects from '@/components/sections/Projects';
import Clients from '@/components/sections/Clients';
import News from '@/components/sections/News';
import Contact from '@/components/sections/Contact';

const sections = [
    { id: 'home', name: 'Home', component: <Hero /> },
    { id: 'about', name: 'About', component: <About /> },
    { id: 'experience', name: 'Experience', component: <Experience /> },
    { id: 'services', name: 'Services', component: <Services /> },
    { id: 'projects', name: 'Projects', component: <Projects /> },
    { id: 'clients', name: 'Clients', component: <Clients /> },
    { id: 'news', name: 'News', component: <News /> },
    { id: 'contact', name: 'Contact', component: <Contact /> },
];

export default function HomePageClient() {
    const [activeSection, setActiveSection] = useState('home');

    const handleSectionChange = (sectionId: string) => {
        setActiveSection(sectionId);
    };

    return (
        <div className="relative bg-bg">
            {/* Fixed UI Elements */}
            <LeftSidebar />
            <TopNav activeSection={activeSection} />

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

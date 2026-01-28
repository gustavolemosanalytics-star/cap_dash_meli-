'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NextImage from 'next/image';
import {
    LayoutDashboard,
    Megaphone,
    Image as ImageIcon,
    GitBranch,
    Settings,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/criativos', icon: ImageIcon, label: 'Criativos' },
];

// Logo component
function Logo({ expanded }: { expanded: boolean }) {
    return (
        <div className={cn(
            'flex items-center justify-center h-20 transition-all duration-300',
            expanded ? 'px-6' : 'px-2'
        )}>
            <motion.div
                className="flex items-center gap-3"
                initial={false}
                animate={{ width: expanded ? 'auto' : '40px' }}
            >
                {/* Logo Image */}
                <div className="relative flex-shrink-0 w-10 h-10">
                    <NextImage
                        src="/logo-somos.png"
                        alt="Somos Preta Logo"
                        fill
                        className="object-contain"
                        sizes="40px"
                    />
                </div>

                <AnimatePresence>
                    {expanded && (
                        <motion.span
                            className="font-bold text-lg text-meli-blue whitespace-nowrap overflow-hidden"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            Meli Music
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

// Floating Centered Navbar
export function Navbar() {
    const pathname = usePathname();

    return (
        <motion.nav
            className="fixed top-6 left-1/2 z-50 hidden lg:flex items-center gap-1 bg-meli-blue/95 backdrop-blur-md shadow-xl shadow-meli-blue/20 border border-white/10 rounded-full px-2 py-2 pr-6"
            initial={{ y: -100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
            {/* Logo Section */}
            <div className="flex items-center gap-3 pr-6 pl-4 border-r border-white/10">
                <div className="relative w-24 h-8">
                    <NextImage
                        src="/assets/UM_MeliMusic26Logo.png"
                        alt="Meli Music Logo"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 96px, 120px"
                        priority
                    />
                </div>
            </div>

            {/* Nav Items */}
            <div className="flex items-center gap-1 pl-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300',
                                isActive
                                    ? 'text-meli-blue'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white rounded-full shadow-md"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2 font-medium text-sm">
                                <Icon className={cn("w-4 h-4", isActive ? "text-meli-blue" : "text-meli-yellow")} />
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </motion.nav>
    );
}

// Mobile Bottom Navigation
export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-4 left-4 right-4 bg-meli-blue/95 backdrop-blur-md shadow-xl shadow-meli-blue/20 border border-white/10 rounded-2xl lg:hidden z-40">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.slice(0, 4).map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors',
                                isActive
                                    ? 'text-white'
                                    : 'text-gray-400'
                            )}
                        >
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className={cn(
                                    'p-2 rounded-xl transition-colors',
                                    isActive && 'bg-white/10'
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-meli-yellow" : "fill-current")} />
                            </motion.div>
                            <span className={cn("text-[10px] font-medium", isActive ? "text-white" : "")}>{item.label.split(' ')[0]}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

// Page Layout Wrapper
interface PageLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export function PageLayout({ children, title, subtitle }: PageLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
            <MobileNav />

            {/* Main Content - Added padding top for navbar space */}
            <main className="pt-32 pb-24 lg:pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.header
                        className="mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-2xl sm:text-3xl font-bold text-meli-text">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-meli-text-secondary mt-1">
                                {subtitle}
                            </p>
                        )}
                    </motion.header>

                    {children}

                    {/* Footer Sponsors */}
                    <div className="mt-12 mb-4 flex justify-center opacity-80 hover:opacity-100 transition-opacity">
                        <div className="relative w-full max-w-4xl h-24 sm:h-32">
                            <NextImage
                                src="/assets/UM_MeliMusic26Patrocinadores.png"
                                alt="Patrocinadores Meli Music"
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, 800px"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

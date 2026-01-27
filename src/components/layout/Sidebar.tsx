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
            className="fixed top-6 left-1/2 z-50 hidden lg:flex items-center gap-1 bg-white/90 backdrop-blur-md shadow-xl shadow-meli-blue/5 border border-white/20 rounded-full px-2 py-2 pr-6"
            initial={{ y: -100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
            {/* Logo Section */}
            <div className="flex items-center gap-3 pr-6 pl-4 border-r border-gray-200/50">
                <div className="relative w-8 h-8">
                    <NextImage
                        src="/logo-somos.png"
                        alt="Meli Music Logo"
                        fill
                        className="object-contain"
                        sizes="32px"
                    />
                </div>
                <span className="font-bold text-meli-blue whitespace-nowrap">
                    Meli Music
                </span>
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
                                    ? 'text-white'
                                    : 'text-gray-500 hover:text-meli-blue hover:bg-gray-50'
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-meli-blue rounded-full shadow-lg shadow-meli-blue/20"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2 font-medium text-sm">
                                <Icon className={cn("w-4 h-4", isActive ? "text-meli-yellow" : "text-current")} />
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
        <nav className="fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md shadow-xl border border-gray-100/50 rounded-2xl lg:hidden z-40">
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
                                    ? 'text-meli-blue'
                                    : 'text-meli-text-secondary'
                            )}
                        >
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className={cn(
                                    'p-2 rounded-xl transition-colors',
                                    isActive && 'bg-meli-yellow/10'
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive && "fill-current")} />
                            </motion.div>
                            <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
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
                </div>
            </main>
        </div>
    );
}

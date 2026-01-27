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

// Floating Desktop Sidebar with spacing
export function Sidebar() {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="fixed left-0 top-0 h-screen p-4 z-40 hidden lg:block pointer-events-none">
            <motion.aside
                className="h-full bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden pointer-events-auto border border-gray-100/50"
                initial={false}
                animate={{ width: expanded ? 260 : 80 }}
                onMouseEnter={() => setExpanded(true)}
                onMouseLeave={() => setExpanded(false)}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                <Logo expanded={expanded} />

                <nav className="flex flex-col gap-2 p-3 mt-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group overflow-hidden',
                                    isActive
                                        ? 'bg-meli-blue text-white shadow-lg shadow-meli-blue/20'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-meli-blue'
                                )}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative z-10"
                                >
                                    <Icon className={cn("w-6 h-6 flex-shrink-0", isActive ? "text-meli-yellow" : "text-current")} />
                                </motion.div>

                                <AnimatePresence>
                                    {expanded && (
                                        <motion.span
                                            className="font-medium whitespace-nowrap overflow-hidden relative z-10"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2, delay: 0.1 }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {isActive && expanded && (
                                    <motion.div
                                        className="ml-auto relative z-10"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <ChevronRight className="w-4 h-4 text-meli-yellow" />
                                    </motion.div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </motion.aside>
        </div>
    );
}

// Mobile Bottom Navigation
export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-4 left-4 right-4 bg-white shadow-xl border border-gray-100 rounded-2xl lg:hidden z-40">
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
                                    isActive && 'bg-meli-yellow'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                            </motion.div>
                            <span className="text-xs font-medium">{item.label.split(' ')[0]}</span>
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
        <div className="min-h-screen bg-background">
            <Sidebar />
            <MobileNav />

            <main className="lg:ml-[100px] pb-24 lg:pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <motion.header
                        className="mb-8"
                        initial={{ opacity: 0, y: -20 }}
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

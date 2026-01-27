'use client';

import { motion } from 'framer-motion';

const handVariants = {
    wave: {
        rotate: [0, 14, -8, 14, -4, 10, 0],
        transition: {
            duration: 2.5,
            repeat: Infinity,
            repeatType: "loop" as const
        }
    },
    bounce: {
        y: [0, -20, 0],
        transition: {
            duration: 0.6,
            repeat: Infinity,
            repeatType: "reverse" as const
        }
    },
    float: {
        y: [0, -10, -5, 0],
        rotate: [0, 5, -3, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            repeatType: "loop" as const
        }
    }
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
    }
};

// Meli hand SVG - simplified thumbs up
function MeliHand({ className = '', size = 48 }: { className?: string; size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M14 26V42H8V26H14ZM38 20C39.1 20 40 20.9 40 22V36C40 37.1 39.1 38 38 38H22L16 32V22C16 20.9 16.9 20 18 20H38ZM38 16H18C14.7 16 12 18.7 12 22V32L18 38H38C41.3 38 44 35.3 44 32V22C44 18.7 41.3 16 38 16ZM26 6C23.8 6 22 7.8 22 10V16H26V10C26 9.4 26.4 9 27 9H29C29.6 9 30 9.4 30 10V16H34V10C34 7.8 32.2 6 30 6H26Z"
                fill="#FFE600"
            />
            <path
                d="M14 26V42H8V26H14Z"
                fill="#2D3277"
            />
        </svg>
    );
}

interface MeliHandsLoaderProps {
    message?: string;
    fullscreen?: boolean;
}

export function MeliHandsLoader({ message = 'Carregando...', fullscreen = true }: MeliHandsLoaderProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center gap-6 ${fullscreen ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50' : 'py-12'
                }`}
        >
            <motion.div
                className="flex items-center gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Hand 1 - Wave */}
                <motion.div
                    variants={itemVariants}
                    animate="wave"
                    custom={handVariants.wave}
                    style={{ transformOrigin: 'bottom center' }}
                >
                    <motion.div
                        animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatType: "loop" }}
                    >
                        <MeliHand size={56} />
                    </motion.div>
                </motion.div>

                {/* Hand 2 - Bounce */}
                <motion.div
                    variants={itemVariants}
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse", delay: 0.2 }}
                >
                    <MeliHand size={64} />
                </motion.div>

                {/* Hand 3 - Float */}
                <motion.div
                    variants={itemVariants}
                    animate={{
                        y: [0, -10, -5, 0],
                        rotate: [0, 5, -3, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "loop", delay: 0.4 }}
                >
                    <MeliHand size={56} />
                </motion.div>
            </motion.div>

            <motion.p
                className="text-meli-text-secondary text-lg font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                {message}
            </motion.p>
        </div>
    );
}

// Skeleton components for loading states
export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`card p-6 ${className}`}>
            <div className="skeleton h-4 w-24 rounded mb-3"></div>
            <div className="skeleton h-8 w-32 rounded mb-2"></div>
            <div className="skeleton h-3 w-20 rounded"></div>
        </div>
    );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <div className="skeleton h-6 w-48 rounded"></div>
            </div>
            <div className="divide-y divide-gray-100">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="p-4 flex gap-4">
                        <div className="skeleton h-4 w-32 rounded"></div>
                        <div className="skeleton h-4 w-24 rounded"></div>
                        <div className="skeleton h-4 w-20 rounded"></div>
                        <div className="skeleton h-4 w-16 rounded flex-1"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SkeletonCreativeGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                    <div className="skeleton aspect-video"></div>
                    <div className="p-4">
                        <div className="skeleton h-5 w-3/4 rounded mb-2"></div>
                        <div className="skeleton h-4 w-1/2 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

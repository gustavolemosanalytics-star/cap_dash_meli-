'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
    title: string;
    value: string | number;
    formattedValue: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'default' | 'success' | 'alert' | 'blue' | 'yellow';
    delay?: number;
}

const colorClasses = {
    default: {
        icon: 'bg-gray-100 text-meli-text',
        trend: 'text-meli-text-secondary'
    },
    success: {
        icon: 'bg-green-100 text-meli-success',
        trend: 'text-meli-success'
    },
    alert: {
        icon: 'bg-red-100 text-meli-alert',
        trend: 'text-meli-alert'
    },
    blue: {
        icon: 'bg-blue-100 text-meli-blue',
        trend: 'text-meli-blue'
    },
    yellow: {
        icon: 'bg-yellow-100 text-yellow-700',
        trend: 'text-yellow-700'
    }
};

function useCountUp(end: number, duration: number = 1000, start: number = 0) {
    const [count, setCount] = useState(start);

    useEffect(() => {
        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * (end - start) + start));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [end, duration, start]);

    return count;
}

export function KPICard({
    title,
    value,
    formattedValue,
    icon: Icon,
    trend,
    color = 'default',
    delay = 0
}: KPICardProps) {
    const colorClass = colorClasses[color];
    const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    const animatedValue = useCountUp(numericValue, 1000);

    // Format the animated value similar to the final format
    const displayValue = typeof value === 'number'
        ? formattedValue.replace(/[\d.,]+/, animatedValue.toLocaleString('pt-BR'))
        : formattedValue;

    return (
        <motion.div
            className="card p-6 hover:shadow-lg transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={cn('p-3 rounded-xl', colorClass.icon)}>
                    <Icon className="w-5 h-5" />
                </div>

                {trend && (
                    <div className={cn(
                        'flex items-center gap-1 text-sm font-medium',
                        trend.isPositive ? 'text-meli-success' : 'text-meli-alert'
                    )}>
                        <span>{trend.isPositive ? '↑' : '↓'}</span>
                        <span>{Math.abs(trend.value).toFixed(1)}%</span>
                    </div>
                )}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay * 0.1 + 0.2 }}
            >
                <p className="text-meli-text-secondary text-sm font-medium mb-1">
                    {title}
                </p>
                <p className="text-2xl font-bold text-meli-text">
                    {formattedValue}
                </p>
            </motion.div>
        </motion.div>
    );
}

// Grid wrapper for KPI cards
export function KPIGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {children}
        </div>
    );
}

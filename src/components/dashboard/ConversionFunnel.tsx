'use client';

import { motion } from 'framer-motion';
import { formatNumber, cn } from '@/lib/utils';

interface FunnelStep {
    name: string;
    value: number;
    percentage?: number;
    conversionFromPrevious?: number;
}

interface VisualFunnelProps {
    steps: FunnelStep[];
}

export function VisualFunnel({ steps }: VisualFunnelProps) {
    const maxValue = Math.max(...steps.map(s => s.value), 1);

    // Map names to display (if needed for future translations)
    const displayNames: Record<string, string> = {};

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-meli-text mb-6">Funil de Conversão</h3>

            {/* Visual Funnel Shape */}
            <div className="relative flex flex-col items-center gap-0">
                {steps.map((step, index) => {
                    const widthPercent = Math.max((step.value / maxValue) * 100, 20);
                    const isLast = index === steps.length - 1;
                    const conversionRate = step.conversionFromPrevious || (
                        index > 0 && steps[index - 1].value > 0
                            ? (step.value / steps[index - 1].value) * 100
                            : 100
                    );

                    // Gradient colors from yellow to blue
                    const colors = [
                        'from-meli-yellow to-yellow-400',
                        'from-yellow-400 to-amber-400',
                        'from-amber-400 to-orange-400',
                        'from-orange-400 to-indigo-400',
                        'from-indigo-400 to-indigo-500',
                        'from-indigo-500 to-meli-blue',
                    ];

                    const displayName = displayNames[step.name] || step.name;

                    return (
                        <div key={step.name} className="w-full flex flex-col items-center">
                            {/* Funnel segment */}
                            <motion.div
                                className={cn(
                                    'relative flex items-center justify-center py-3 bg-gradient-to-r',
                                    colors[index % colors.length],
                                    index === 0 && 'rounded-t-xl',
                                    isLast && 'rounded-b-xl'
                                )}
                                style={{
                                    clipPath: isLast
                                        ? 'polygon(5% 0%, 95% 0%, 90% 100%, 10% 100%)'
                                        : `polygon(${50 - widthPercent/2}% 0%, ${50 + widthPercent/2}% 0%, ${50 + (widthPercent * 0.85)/2}% 100%, ${50 - (widthPercent * 0.85)/2}% 100%)`,
                                }}
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1, width: `${widthPercent}%` }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="text-center z-10 px-2">
                                    <p className="text-xs font-bold text-white drop-shadow-sm truncate max-w-[120px]">
                                        {displayName}
                                    </p>
                                    <p className="text-sm font-bold text-white drop-shadow-sm">
                                        {formatNumber(step.value)}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Conversion percentage between steps */}
                            {!isLast && (
                                <div className="relative z-20 -my-1">
                                    <motion.div
                                        className={cn(
                                            'px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm',
                                            conversionRate >= 30
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : conversionRate >= 10
                                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                                : 'bg-red-100 text-red-700 border border-red-200'
                                        )}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                                    >
                                        {conversionRate.toFixed(1)}%
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-meli-text-secondary text-center">
                    Porcentagens indicam conversão entre etapas
                </p>
            </div>
        </div>
    );
}

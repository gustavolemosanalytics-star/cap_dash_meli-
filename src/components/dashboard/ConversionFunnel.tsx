'use client';

import { motion } from 'framer-motion';
import { formatNumber, cn } from '@/lib/utils';

interface FunnelStep {
    name: string;
    value: number;
    percentage?: number;
    conversionFromPrevious?: number;
}

interface TrapezoidFunnelProps {
    steps: FunnelStep[];
    profiles?: string[];
    selectedProfile?: string;
    onProfileChange?: (profile: string) => void;
}

export function TrapezoidFunnel({ steps, profiles = [], selectedProfile = 'TODOS', onProfileChange }: TrapezoidFunnelProps) {
    // Colors for the funnel stages (top to bottom)
    const colors = [
        '#2D3277', // Dark blue - Impressões
        '#3B5998', // Medium blue - Cliques
        '#5B7EC2', // Light blue - Page View
        '#F7B928', // Yellow - Add to Cart
        '#E07B39', // Orange - Checkout
        '#C85A3B', // Red-orange - Compra
    ];

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 mb-2">
                <h3 className="text-lg font-bold text-meli-text">Funil de Conversão</h3>

                {onProfileChange && profiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 bg-gray-100/80 p-1.5 rounded-lg">
                        <button
                            onClick={() => onProfileChange('TODOS')}
                            className={cn(
                                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                                selectedProfile === 'TODOS'
                                    ? "bg-white text-meli-blue shadow-sm"
                                    : "text-gray-500 hover:text-meli-text hover:bg-white/50"
                            )}
                        >
                            Todos
                        </button>
                        {profiles.map((profile) => (
                            <button
                                key={profile}
                                onClick={() => onProfileChange(profile)}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                                    selectedProfile === profile
                                        ? "bg-white text-meli-blue shadow-sm"
                                        : "text-gray-500 hover:text-meli-text hover:bg-white/50"
                                )}
                            >
                                {profile}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Real Funnel Shape */}
            <div className="flex flex-col items-center w-full">
                {steps.map((step, index) => {
                    // Calculate width percentage (decreasing from 100% to minimum)
                    const widthPercent = 100 - (index * 12);
                    const isLast = index === steps.length - 1;

                    // Calculate conversion rate TO the next step
                    const nextStep = steps[index + 1];
                    const conversionToNext = !isLast && nextStep && step.value > 0
                        ? (nextStep.value / step.value) * 100
                        : 0;

                    return (
                        <div key={step.name} className="w-full flex flex-col items-center">
                            {/* Funnel segment */}
                            <motion.div
                                className="relative flex flex-col items-center justify-center py-3 text-white"
                                style={{
                                    width: `${widthPercent}%`,
                                    backgroundColor: colors[index % colors.length],
                                    clipPath: isLast
                                        ? 'polygon(8% 0%, 92% 0%, 85% 100%, 15% 100%)'
                                        : 'polygon(0% 0%, 100% 0%, 96% 100%, 4% 100%)',
                                    minHeight: '52px',
                                }}
                                initial={{ opacity: 0, scaleY: 0 }}
                                animate={{ opacity: 1, scaleY: 1 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <span className="text-xs font-semibold opacity-90">
                                    {step.name}
                                </span>
                                <span className="text-base font-bold">
                                    {formatNumber(step.value)}
                                </span>
                            </motion.div>

                            {/* Conversion percentage badge between segments */}
                            {!isLast && (
                                <motion.div
                                    className={cn(
                                        'z-10 -my-2 px-3 py-1 rounded-full text-xs font-bold shadow-md border-2 border-white',
                                        conversionToNext >= 30
                                            ? 'bg-green-500 text-white'
                                            : conversionToNext >= 10
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-red-500 text-white'
                                    )}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                                >
                                    {conversionToNext.toFixed(1).replace('.', ',')}%
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-center gap-4 text-xs text-meli-text-secondary">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>≥30%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span>10-30%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span>&lt;10%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Keep the old export for backward compatibility
export { TrapezoidFunnel as VisualFunnel };

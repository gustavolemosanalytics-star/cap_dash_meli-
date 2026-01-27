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
}

// Trapezoid Funnel following the design image
export function TrapezoidFunnel({ steps }: TrapezoidFunnelProps) {
    // Colors matching the reference image (top to bottom)
    const colors = [
        '#2D3277', // Dark blue - Awareness/Impressões
        '#3B5998', // Medium blue - Interest/Cliques
        '#F7B928', // Yellow - Decision/Page View
        '#E8A825', // Gold - Add to Cart
        '#E07B39', // Orange - Checkout
        '#C85A3B', // Red-orange - Action/Compra
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-meli-text mb-6">Funil de Conversão</h3>

            {/* Trapezoid Funnel Shape */}
            <div className="relative">
                <svg viewBox="0 0 200 300" className="w-full max-w-[250px] mx-auto">
                    {steps.map((step, index) => {
                        const topWidth = 200 - (index * 25);
                        const bottomWidth = 200 - ((index + 1) * 25);
                        const yStart = index * 50;
                        const height = 50;

                        const topLeftX = (200 - topWidth) / 2;
                        const topRightX = topLeftX + topWidth;
                        const bottomLeftX = (200 - bottomWidth) / 2;
                        const bottomRightX = bottomLeftX + bottomWidth;

                        return (
                            <g key={step.name}>
                                <motion.path
                                    d={`M ${topLeftX} ${yStart} L ${topRightX} ${yStart} L ${bottomRightX} ${yStart + height} L ${bottomLeftX} ${yStart + height} Z`}
                                    fill={colors[index % colors.length]}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                />
                                {/* Step label */}
                                <text
                                    x="100"
                                    y={yStart + height / 2 + 5}
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize="11"
                                    fontWeight="600"
                                    className="select-none"
                                >
                                    {step.name}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Values and percentages on the right */}
                <div className="absolute top-0 right-0 h-full flex flex-col justify-around py-2">
                    {steps.map((step, index) => {
                        const conversionRate = index > 0 && steps[index - 1].value > 0
                            ? (step.value / steps[index - 1].value) * 100
                            : 100;

                        return (
                            <motion.div
                                key={step.name}
                                className="text-right"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                            >
                                <p className="text-sm font-bold text-meli-text">
                                    {formatNumber(step.value)}
                                </p>
                                {index > 0 && (
                                    <p className={cn(
                                        'text-[10px] font-semibold',
                                        conversionRate >= 30 ? 'text-green-600' :
                                        conversionRate >= 10 ? 'text-amber-600' : 'text-red-500'
                                    )}>
                                        {conversionRate.toFixed(1)}%
                                    </p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
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

// Keep the old export for backward compatibility
export { TrapezoidFunnel as VisualFunnel };

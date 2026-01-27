'use client';

import { useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { CampaignData } from '@/types/campaign';
import { formatCurrency, formatNumber, parseDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PerformanceChartProps {
    data: CampaignData[];
    className?: string;
    height?: string | number;
}

type MetricKey = 'spend' | 'conversions' | 'roas' | 'clicks';

const metricConfig: Record<MetricKey, { label: string; color: string; format: (v: number) => string }> = {
    spend: {
        label: 'Investimento',
        color: '#2D3277',
        format: (v) => formatCurrency(v)
    },
    conversions: {
        label: 'Conversões',
        color: '#00A650',
        format: (v) => formatNumber(v)
    },
    roas: {
        label: 'ROAS',
        color: '#FFE600',
        format: (v) => v.toFixed(2) + 'x'
    },
    clicks: {
        label: 'Cliques',
        color: '#F23D4F',
        format: (v) => formatNumber(v)
    },
};

export function PerformanceChart({ data, className, height = 320 }: PerformanceChartProps) {
    const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(['spend', 'conversions']);

    // Aggregate data by date
    const chartData = useMemo(() => {
        const grouped = new Map<string, {
            date: string;
            spend: number;
            conversions: number;
            clicks: number;
            revenue: number;
        }>();

        data.forEach(item => {
            const existing = grouped.get(item.date) || {
                date: item.date,
                spend: 0,
                conversions: 0,
                clicks: 0,
                revenue: 0,
            };

            grouped.set(item.date, {
                ...existing,
                spend: existing.spend + item.spend,
                conversions: existing.conversions + item.actions_offsite_conversion_fb_pixel_purchase,
                clicks: existing.clicks + item.actions_link_click,
                revenue: existing.revenue + item.action_values_omni_purchase,
            });
        });

        return Array.from(grouped.values())
            .map(item => ({
                ...item,
                roas: item.spend > 0 ? item.revenue / item.spend : 0,
                // Format date for display
                dateFormatted: item.date,
            }))
            .sort((a, b) => {
                const dateA = parseDate(a.date);
                const dateB = parseDate(b.date);
                return dateA.getTime() - dateB.getTime();
            });
    }, [data]);

    const toggleMetric = (metric: MetricKey) => {
        setActiveMetrics(prev =>
            prev.includes(metric)
                ? prev.filter(m => m !== metric)
                : [...prev, metric]
        );
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4">
                    <p className="font-semibold text-meli-text mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-meli-text-secondary">{entry.name}:</span>
                            <span className="font-medium text-meli-text">
                                {metricConfig[entry.dataKey as MetricKey]?.format(entry.value) || entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={cn('flex flex-col', className)}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>{/* Title is now handled by parent */}</div>

                {/* Metric toggles */}
                <div className="flex flex-wrap gap-2">
                    {(Object.keys(metricConfig) as MetricKey[]).map(metric => (
                        <button
                            key={metric}
                            onClick={() => toggleMetric(metric)}
                            className={cn(
                                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                activeMetrics.includes(metric)
                                    ? 'bg-opacity-100 text-white shadow-md'
                                    : 'bg-opacity-20 text-gray-600 hover:bg-opacity-40'
                            )}
                            style={{
                                backgroundColor: activeMetrics.includes(metric)
                                    ? metricConfig[metric].color
                                    : `${metricConfig[metric].color}33`
                            }}
                        >
                            {metricConfig[metric].label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            {(Object.keys(metricConfig) as MetricKey[]).map(metric => (
                                <linearGradient key={metric} id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={metricConfig[metric].color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={metricConfig[metric].color} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="dateFormatted"
                            tick={{ fontSize: 12, fill: '#666' }}
                            tickLine={false}
                            axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#666' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                                return value;
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: 20 }}
                            formatter={(value) => <span className="text-sm text-meli-text">{value}</span>}
                        />

                        {activeMetrics.map(metric => (
                            <Area
                                key={metric}
                                type="monotone"
                                dataKey={metric}
                                name={metricConfig[metric].label}
                                stroke={metricConfig[metric].color}
                                strokeWidth={2}
                                fill={`url(#gradient-${metric})`}
                                dot={false}
                                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

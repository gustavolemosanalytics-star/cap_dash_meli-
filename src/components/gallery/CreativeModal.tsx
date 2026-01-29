'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { CampaignData } from '@/types/campaign';
import { formatCurrency, formatNumber, cn, parseDate } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CreativeModalProps {
    creative: CampaignData | null;
    allData?: CampaignData[]; // Full data to filter by creative for real chart data
    isOpen: boolean;
    onClose: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    hasPrevious?: boolean;
    hasNext?: boolean;
}

// Trapezoid Funnel for modal (same format as homepage)
function ModalTrapezoidFunnel({
    impressions,
    clicks,
    landingPageViews,
    addToCart,
    checkout,
    purchases
}: {
    impressions: number;
    clicks: number;
    landingPageViews: number;
    addToCart: number;
    checkout: number;
    purchases: number;
}) {
    const steps = [
        { name: 'Impressões', value: impressions },
        { name: 'Cliques', value: clicks },
        { name: 'Page View', value: landingPageViews },
        { name: 'Add to Cart', value: addToCart },
        { name: 'Checkout', value: checkout },
        { name: 'Compra', value: purchases },
    ];

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
                            className="relative flex flex-col items-center justify-center py-2 text-white"
                            style={{
                                width: `${widthPercent}%`,
                                backgroundColor: colors[index % colors.length],
                                clipPath: isLast
                                    ? 'polygon(8% 0%, 92% 0%, 85% 100%, 15% 100%)'
                                    : 'polygon(0% 0%, 100% 0%, 96% 100%, 4% 100%)',
                                minHeight: '36px',
                            }}
                            initial={{ opacity: 0, scaleY: 0 }}
                            animate={{ opacity: 1, scaleY: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <span className="text-[9px] font-semibold opacity-90">
                                {step.name}
                            </span>
                            <span className="text-[11px] font-bold">
                                {formatNumber(step.value)}
                            </span>
                        </motion.div>

                        {/* Conversion percentage badge between segments */}
                        {!isLast && (
                            <motion.div
                                className={cn(
                                    'z-10 -my-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold shadow-md border-2 border-white',
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
    );
}

// Generate real time series data from spreadsheet data
function generateRealTimeSeriesData(creative: CampaignData, allData: CampaignData[]) {
    // Filter data for this specific creative by ad_name
    const creativeData = allData.filter(item => item.ad_name === creative.ad_name);

    // Group by date
    const dateMap = new Map<string, { impressions: number; cliques: number; spend: number }>();

    creativeData.forEach(item => {
        const existing = dateMap.get(item.date) || { impressions: 0, cliques: 0, spend: 0 };
        dateMap.set(item.date, {
            impressions: existing.impressions + item.impressions,
            cliques: existing.cliques + item.actions_link_click,
            spend: existing.spend + item.spend,
        });
    });

    // Convert to array and sort by date
    const result = Array.from(dateMap.entries())
        .map(([date, data]) => {
            const parsedDate = parseDate(date);
            return {
                date,
                dateLabel: format(parsedDate, 'dd/MM', { locale: ptBR }),
                ...data,
            };
        })
        .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

    return result;
}

export function CreativeModal({
    creative,
    allData = [],
    isOpen,
    onClose,
    onPrevious,
    onNext,
    hasPrevious = false,
    hasNext = false
}: CreativeModalProps) {
    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'Escape':
                onClose();
                break;
            case 'ArrowLeft':
                if (hasPrevious && onPrevious) onPrevious();
                break;
            case 'ArrowRight':
                if (hasNext && onNext) onNext();
                break;
        }
    }, [isOpen, onClose, onPrevious, onNext, hasPrevious, hasNext]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Generate time series data from real spreadsheet data
    const timeSeriesData = useMemo(() => {
        if (!creative || allData.length === 0) return [];
        return generateRealTimeSeriesData(creative, allData);
    }, [creative, allData]);

    if (!creative) return null;

    // Calculate metrics
    const ctr = creative.impressions > 0
        ? (creative.actions_link_click / creative.impressions * 100)
        : 0;
    const cpc = creative.actions_link_click > 0
        ? creative.spend / creative.actions_link_click
        : 0;
    const roas = creative.spend > 0
        ? creative.action_values_omni_purchase / creative.spend
        : 0;

    const metrics = [
        { label: 'Investimento', value: formatCurrency(creative.spend), color: 'blue' },
        { label: 'Impressões', value: formatNumber(creative.impressions), color: 'default' },
        { label: 'Cliques', value: formatNumber(creative.actions_link_click), color: 'default' },
        { label: 'CTR', value: `${ctr.toFixed(2)}%`, color: ctr > 1 ? 'success' : 'default' },
        { label: 'Compras', value: formatNumber(creative.actions_offsite_conversion_fb_pixel_purchase), color: 'success' },
        { label: 'ROAS', value: `${roas.toFixed(2)}x`, color: roas >= 3 ? 'success' : roas >= 1 ? 'blue' : 'alert' },
        { label: 'CPC', value: formatCurrency(cpc), color: 'default' },
        { label: 'Receita', value: formatCurrency(creative.action_values_omni_purchase), color: 'success' },
    ];

    const colorClasses: Record<string, string> = {
        default: 'text-meli-text',
        success: 'text-meli-success',
        alert: 'text-meli-alert',
        blue: 'text-meli-blue',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-4 sm:inset-8 lg:inset-12 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-meli-text line-clamp-1">
                                {creative.ad_name}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-meli-text-secondary" />
                            </button>
                        </div>

                        {/* Content - Reorganized Layout */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Image + Metrics */}
                                <div className="lg:col-span-1 flex flex-col gap-6">
                                    {/* Thumbnail */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="relative w-full aspect-square bg-gray-50">
                                            {creative.thumbnail_url ? (
                                                <Image
                                                    src={creative.thumbnail_url}
                                                    alt={creative.ad_name}
                                                    fill
                                                    className="object-contain p-2"
                                                    sizes="(max-width: 1024px) 100vw, 33vw"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-meli-yellow to-meli-blue">
                                                    <span className="text-white font-bold text-lg">Sem imagem</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Metrics Grid - 2 columns for better vertical fit */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h4 className="font-semibold text-meli-text text-sm mb-3">Métricas</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {metrics.map((metric) => (
                                                <div
                                                    key={metric.label}
                                                    className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100"
                                                >
                                                    <p className="text-[10px] text-gray-500 mb-0.5">
                                                        {metric.label}
                                                    </p>
                                                    <p className={cn(
                                                        'text-sm font-bold truncate',
                                                        colorClasses[metric.color]
                                                    )}>
                                                        {metric.value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Chart + Funnel */}
                                <div className="lg:col-span-2 flex flex-col gap-6">
                                    {/* Daily Performance Chart */}
                                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingUp className="w-4 h-4 text-meli-blue" />
                                            <h4 className="font-semibold text-meli-text text-sm">Performance Diária</h4>
                                        </div>
                                        <div className="h-[250px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={timeSeriesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#FFE600" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#FFE600" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#2D3277" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#2D3277" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                                    <XAxis
                                                        dataKey="dateLabel"
                                                        tick={{ fontSize: 11, fill: '#6B7280' }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        dy={10}
                                                        minTickGap={30}
                                                    />
                                                    <YAxis
                                                        tick={{ fontSize: 11, fill: '#6B7280' }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickFormatter={(value) => {
                                                            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                                            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                                            return value;
                                                        }}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                            fontSize: '12px',
                                                            padding: '8px 12px'
                                                        }}
                                                        formatter={(value: number | undefined, name: string | undefined) => [
                                                            (value || 0).toLocaleString('pt-BR'),
                                                            name === 'impressions' ? 'Impressões' : 'Cliques'
                                                        ]}
                                                        labelFormatter={(label) => <span className="font-semibold text-gray-700">{label}</span>}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="impressions"
                                                        name="impressions"
                                                        stroke="#FFE600"
                                                        strokeWidth={2}
                                                        fill="url(#colorImpressions)"
                                                        activeDot={{ r: 4, strokeWidth: 0 }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="cliques"
                                                        name="cliques"
                                                        stroke="#2D3277"
                                                        strokeWidth={2}
                                                        fill="url(#colorClicks)"
                                                        activeDot={{ r: 4, strokeWidth: 0 }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Funnel */}
                                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex-1">
                                        <h4 className="font-semibold text-meli-text text-sm mb-4">
                                            Funil de Conversão
                                        </h4>
                                        <div className="flex-1 flex items-center">
                                            <ModalTrapezoidFunnel
                                                impressions={creative.impressions}
                                                clicks={creative.actions_link_click}
                                                landingPageViews={creative.actions_landing_page_view}
                                                addToCart={creative.actions_add_to_cart}
                                                checkout={creative.actions_initiate_checkout}
                                                purchases={creative.actions_offsite_conversion_fb_pixel_purchase}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation arrows */}
                        {(hasPrevious || hasNext) && (
                            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none px-2">
                                {hasPrevious ? (
                                    <button
                                        onClick={onPrevious}
                                        className="pointer-events-auto p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-meli-text" />
                                    </button>
                                ) : <div />}
                                {hasNext ? (
                                    <button
                                        onClick={onNext}
                                        className="pointer-events-auto p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <ChevronRight className="w-6 h-6 text-meli-text" />
                                    </button>
                                ) : <div />}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

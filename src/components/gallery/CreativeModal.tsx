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
import { formatCurrency, formatNumber, cn } from '@/lib/utils';

interface CreativeModalProps {
    creative: CampaignData | null;
    isOpen: boolean;
    onClose: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    hasPrevious?: boolean;
    hasNext?: boolean;
}

type PeriodType = 'daily' | 'weekly' | 'monthly';

// Visual Funnel for modal
function ModalFunnel({
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
        { label: 'Impressões', value: impressions },
        { label: 'Cliques', value: clicks },
        { label: 'Page View', value: landingPageViews },
        { label: 'Add to Cart', value: addToCart },
        { label: 'Checkout', value: checkout },
        { label: 'Compra', value: purchases },
    ];

    const maxValue = Math.max(...steps.map(s => s.value), 1);

    const colors = [
        'from-meli-yellow to-yellow-400',
        'from-yellow-400 to-amber-400',
        'from-amber-400 to-orange-400',
        'from-orange-400 to-indigo-400',
        'from-indigo-400 to-indigo-500',
        'from-indigo-500 to-meli-blue',
    ];

    return (
        <div className="space-y-1">
            {steps.map((step, index) => {
                const widthPercent = Math.max((step.value / maxValue) * 100, 15);
                const isLast = index === steps.length - 1;
                const conversionRate = index > 0 && steps[index - 1].value > 0
                    ? ((step.value / steps[index - 1].value) * 100).toFixed(1)
                    : '100';

                return (
                    <div key={step.label} className="flex flex-col items-center">
                        <motion.div
                            className={cn(
                                'relative flex items-center justify-between px-3 py-2 bg-gradient-to-r text-white',
                                colors[index],
                                index === 0 && 'rounded-t-lg',
                                isLast && 'rounded-b-lg'
                            )}
                            style={{ width: `${widthPercent}%` }}
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.08 }}
                        >
                            <span className="text-[10px] font-semibold truncate">{step.label}</span>
                            <span className="text-[10px] font-bold">{formatNumber(step.value)}</span>
                        </motion.div>

                        {!isLast && (
                            <motion.div
                                className={cn(
                                    'px-1.5 py-0.5 rounded text-[8px] font-bold -my-0.5 z-10',
                                    parseFloat(conversionRate) >= 30
                                        ? 'bg-green-100 text-green-700'
                                        : parseFloat(conversionRate) >= 10
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-red-100 text-red-700'
                                )}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: index * 0.08 + 0.2 }}
                            >
                                {conversionRate}%
                            </motion.div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// Time series data generator with period options
function generateTimeSeriesData(creative: CampaignData, period: PeriodType) {
    const periodConfig = {
        daily: { count: 7, label: 'Dia' },
        weekly: { count: 4, label: 'Sem' },
        monthly: { count: 3, label: 'Mês' }
    };

    const config = periodConfig[period];
    const baseImpressions = creative.impressions / config.count;
    const baseClicks = creative.actions_link_click / config.count;
    const baseSpend = creative.spend / config.count;

    return Array.from({ length: config.count }, (_, i) => {
        const variance = 0.7 + Math.random() * 0.6;
        return {
            period: `${config.label} ${i + 1}`,
            impressions: Math.round(baseImpressions * variance),
            cliques: Math.round(baseClicks * variance),
            investimento: baseSpend * variance,
        };
    });
}

export function CreativeModal({
    creative,
    isOpen,
    onClose,
    onPrevious,
    onNext,
    hasPrevious = false,
    hasNext = false
}: CreativeModalProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('daily');

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

    // Generate time series data
    const timeSeriesData = useMemo(() => {
        if (!creative) return [];
        return generateTimeSeriesData(creative, selectedPeriod);
    }, [creative, selectedPeriod]);

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

    const periodLabels: Record<PeriodType, string> = {
        daily: 'Diário',
        weekly: 'Semanal',
        monthly: 'Mensal'
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

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left: Image and Funnel */}
                                <div className="space-y-6">
                                    {/* Thumbnail - full proportion without cropping */}
                                    <div className="relative w-full rounded-xl overflow-hidden bg-gray-100">
                                        {creative.thumbnail_url ? (
                                            <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                                                <Image
                                                    src={creative.thumbnail_url}
                                                    alt={creative.ad_name}
                                                    fill
                                                    className="object-contain"
                                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-meli-yellow to-meli-blue">
                                                <span className="text-white font-bold text-xl">Sem imagem</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Funnel - replaces the information box */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h4 className="font-semibold text-meli-text text-sm mb-4">
                                            Funil de Conversão
                                        </h4>
                                        <ModalFunnel
                                            impressions={creative.impressions}
                                            clicks={creative.actions_link_click}
                                            landingPageViews={creative.actions_landing_page_view}
                                            addToCart={creative.actions_add_to_cart}
                                            checkout={creative.actions_initiate_checkout}
                                            purchases={creative.actions_offsite_conversion_fb_pixel_purchase}
                                        />
                                    </div>
                                </div>

                                {/* Right: Metrics and Chart */}
                                <div className="space-y-6">
                                    {/* Metrics grid */}
                                    <div>
                                        <h4 className="font-semibold text-meli-text text-sm mb-3">Métricas</h4>
                                        <div className="grid grid-cols-4 gap-2">
                                            {metrics.map((metric) => (
                                                <div
                                                    key={metric.label}
                                                    className="bg-gray-50 rounded-xl p-3 text-center"
                                                >
                                                    <p className="text-[10px] text-meli-text-secondary mb-1">
                                                        {metric.label}
                                                    </p>
                                                    <p className={cn(
                                                        'text-sm font-bold',
                                                        colorClasses[metric.color]
                                                    )}>
                                                        {metric.value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Timeline Chart with Period Selector */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-meli-blue" />
                                                <h4 className="font-semibold text-meli-text text-sm">Performance ao Longo do Tempo</h4>
                                            </div>

                                            {/* Period Selector */}
                                            <div className="flex bg-white rounded-lg p-1 shadow-sm">
                                                {(['daily', 'weekly', 'monthly'] as PeriodType[]).map((period) => (
                                                    <button
                                                        key={period}
                                                        onClick={() => setSelectedPeriod(period)}
                                                        className={cn(
                                                            'px-2 py-1 text-[10px] font-semibold rounded transition-all',
                                                            selectedPeriod === period
                                                                ? 'bg-meli-yellow text-meli-blue'
                                                                : 'text-meli-text-secondary hover:text-meli-text'
                                                        )}
                                                    >
                                                        {periodLabels[period]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="h-40">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={timeSeriesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#FFE600" stopOpacity={0.4} />
                                                            <stop offset="95%" stopColor="#FFE600" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#2D3277" stopOpacity={0.4} />
                                                            <stop offset="95%" stopColor="#2D3277" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                                    <XAxis
                                                        dataKey="period"
                                                        tick={{ fontSize: 10, fill: '#666' }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                    />
                                                    <YAxis
                                                        tick={{ fontSize: 10, fill: '#666' }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                            fontSize: '12px'
                                                        }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="impressions"
                                                        name="Impressões"
                                                        stroke="#FFE600"
                                                        strokeWidth={2}
                                                        fill="url(#colorImpressions)"
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="cliques"
                                                        name="Cliques"
                                                        stroke="#2D3277"
                                                        strokeWidth={2}
                                                        fill="url(#colorClicks)"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex justify-center gap-4 mt-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-meli-yellow" />
                                                <span className="text-xs text-meli-text-secondary">Impressões</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-meli-blue" />
                                                <span className="text-xs text-meli-text-secondary">Cliques</span>
                                            </div>
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

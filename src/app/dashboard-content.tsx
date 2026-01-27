'use client';

import { useState, useMemo } from 'react';
import {
    DollarSign,
    TrendingUp,
    Target,
    Activity,
    BarChart3,
    Calendar,
    Sparkles,
    AlertCircle,
    CheckCircle,
    Image as ImageIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { CampaignData, AggregatedKPIs, FunnelStep } from '@/types/campaign';
import { formatCurrency, formatDecimal, formatNumber, cn, parseDate } from '@/lib/utils';
import { PageLayout } from '@/components/layout/Sidebar';
import { KPICard } from '@/components/ui/KPICard';
import { TrapezoidFunnel } from '@/components/dashboard/ConversionFunnel';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { CampaignTable } from '@/components/dashboard/CampaignTable';
import { PerformanceDemographics } from '@/components/dashboard/PerformanceDemographics';
import { calculateKPIs, calculateFunnel, getUniqueCreatives } from '@/lib/sheets';

interface DashboardContentProps {
    data: CampaignData[];
    kpis: AggregatedKPIs;
    funnel: FunnelStep[];
}

// Smart Analysis Component with Creative Highlights
function SmartAnalysisCard({ data, kpis }: { data: CampaignData[], kpis: AggregatedKPIs }) {
    const insights = useMemo(() => {
        const results: Array<{ type: 'success' | 'warning' | 'info', title: string, description: string }> = [];

        // Get unique creatives
        const creatives = getUniqueCreatives(data);

        // Top performing creative by ROAS
        const topCreativeByRoas = creatives
            .map(c => ({
                name: c.ad_name,
                roas: c.spend > 0 ? c.action_values_omni_purchase / c.spend : 0,
                spend: c.spend,
                revenue: c.action_values_omni_purchase
            }))
            .filter(c => c.spend > 100) // Only consider creatives with significant spend
            .sort((a, b) => b.roas - a.roas)[0];

        if (topCreativeByRoas && topCreativeByRoas.roas > 0) {
            results.push({
                type: 'success',
                title: 'Criativo Top ROAS',
                description: `"${topCreativeByRoas.name.substring(0, 40)}${topCreativeByRoas.name.length > 40 ? '...' : ''}" com ROAS de ${topCreativeByRoas.roas.toFixed(2)}x`
            });
        }

        // Most efficient creative by CTR
        const topCreativeByCtr = creatives
            .map(c => ({
                name: c.ad_name,
                ctr: c.impressions > 0 ? (c.actions_link_click / c.impressions) * 100 : 0,
                impressions: c.impressions
            }))
            .filter(c => c.impressions > 1000)
            .sort((a, b) => b.ctr - a.ctr)[0];

        if (topCreativeByCtr && topCreativeByCtr.ctr > 0) {
            results.push({
                type: 'info',
                title: 'Melhor CTR',
                description: `"${topCreativeByCtr.name.substring(0, 40)}${topCreativeByCtr.name.length > 40 ? '...' : ''}" com CTR de ${topCreativeByCtr.ctr.toFixed(2)}%`
            });
        }

        // Creative with most conversions
        const topCreativeByConversions = creatives
            .map(c => ({
                name: c.ad_name,
                conversions: c.actions_offsite_conversion_fb_pixel_purchase,
                revenue: c.action_values_omni_purchase
            }))
            .sort((a, b) => b.conversions - a.conversions)[0];

        if (topCreativeByConversions && topCreativeByConversions.conversions > 0) {
            results.push({
                type: 'success',
                title: 'Mais Conversões',
                description: `"${topCreativeByConversions.name.substring(0, 40)}${topCreativeByConversions.name.length > 40 ? '...' : ''}" com ${formatNumber(topCreativeByConversions.conversions)} compras`
            });
        }

        // Low performing creative warning
        const lowPerformingCreative = creatives
            .map(c => ({
                name: c.ad_name,
                roas: c.spend > 0 ? c.action_values_omni_purchase / c.spend : 0,
                spend: c.spend
            }))
            .filter(c => c.spend > 500 && c.roas < 1)
            .sort((a, b) => a.roas - b.roas)[0];

        if (lowPerformingCreative) {
            results.push({
                type: 'warning',
                title: 'Criativo a Otimizar',
                description: `"${lowPerformingCreative.name.substring(0, 40)}${lowPerformingCreative.name.length > 40 ? '...' : ''}" com ROAS de ${lowPerformingCreative.roas.toFixed(2)}x precisa de atenção`
            });
        }

        return results.slice(0, 4);
    }, [data]);

    const iconMap = {
        success: CheckCircle,
        warning: AlertCircle,
        info: ImageIcon
    };

    const colorMap = {
        success: 'text-green-600 bg-green-50 border-green-200',
        warning: 'text-amber-600 bg-amber-50 border-amber-200',
        info: 'text-meli-blue bg-blue-50 border-blue-200'
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-meli-yellow to-yellow-400 rounded-xl">
                    <Sparkles className="w-5 h-5 text-meli-blue" />
                </div>
                <h3 className="text-lg font-bold text-meli-text">Análise Inteligente</h3>
                <span className="text-xs text-meli-text-secondary bg-gray-100 px-2 py-1 rounded-full ml-2">Destaques de Criativos</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {insights.map((insight, index) => {
                    const Icon = iconMap[insight.type];
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                'p-4 rounded-xl border',
                                colorMap[insight.type]
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm">{insight.title}</p>
                                    <p className="text-xs mt-1 opacity-80">{insight.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

export function DashboardContent({ data, kpis: initialKpis, funnel: initialFunnel }: DashboardContentProps) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return { from: thirtyDaysAgo, to: today };
    });
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    // Filter data by date range
    const filteredData = useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return data;

        return data.filter(item => {
            const itemDate = parseDate(item.date);
            return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
        });
    }, [data, dateRange]);

    // Recalculate KPIs based on filtered data
    const kpis = useMemo(() => calculateKPIs(filteredData), [filteredData]);
    const funnel = useMemo(() => calculateFunnel(filteredData), [filteredData]);

    // Format date range display
    const dateRangeDisplay = useMemo(() => {
        if (!dateRange?.from) return 'Selecione um período';
        if (!dateRange.to) return format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR });
        return `${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}`;
    }, [dateRange]);

    return (
        <PageLayout
            title="Visão Geral"
            subtitle="Acompanhamento de performance de mídia"
        >
            <div className="space-y-8">
                {/* Period Filter - DatePicker */}
                <div className="relative">
                    <button
                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                        className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 w-fit shadow-sm hover:border-meli-yellow hover:shadow-md transition-all cursor-pointer"
                    >
                        <Calendar className="w-5 h-5 text-meli-blue" />
                        <span className="text-sm font-semibold text-meli-text">{dateRangeDisplay}</span>
                    </button>

                    {/* DatePicker Dropdown */}
                    {isDatePickerOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsDatePickerOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50"
                            >
                                <DayPicker
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    locale={ptBR}
                                    numberOfMonths={2}
                                    className="!font-sans"
                                    classNames={{
                                        day_selected: 'bg-meli-yellow text-meli-blue',
                                        day_range_middle: 'bg-meli-yellow/30',
                                        day_range_end: 'bg-meli-yellow text-meli-blue',
                                        day_range_start: 'bg-meli-yellow text-meli-blue',
                                    }}
                                />
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            const today = new Date();
                                            const sevenDaysAgo = new Date();
                                            sevenDaysAgo.setDate(today.getDate() - 7);
                                            setDateRange({ from: sevenDaysAgo, to: today });
                                        }}
                                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        7 dias
                                    </button>
                                    <button
                                        onClick={() => {
                                            const today = new Date();
                                            const fourteenDaysAgo = new Date();
                                            fourteenDaysAgo.setDate(today.getDate() - 14);
                                            setDateRange({ from: fourteenDaysAgo, to: today });
                                        }}
                                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        14 dias
                                    </button>
                                    <button
                                        onClick={() => {
                                            const today = new Date();
                                            const thirtyDaysAgo = new Date();
                                            thirtyDaysAgo.setDate(today.getDate() - 30);
                                            setDateRange({ from: thirtyDaysAgo, to: today });
                                        }}
                                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        30 dias
                                    </button>
                                    <button
                                        onClick={() => {
                                            const today = new Date();
                                            const sixtyDaysAgo = new Date();
                                            sixtyDaysAgo.setDate(today.getDate() - 60);
                                            setDateRange({ from: sixtyDaysAgo, to: today });
                                        }}
                                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        60 dias
                                    </button>
                                    <button
                                        onClick={() => setIsDatePickerOpen(false)}
                                        className="ml-auto px-3 py-1.5 text-xs font-semibold bg-meli-yellow text-meli-blue rounded-lg hover:bg-yellow-400 transition-colors"
                                    >
                                        Aplicar
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </div>

                {/* Smart Analysis Card */}
                <SmartAnalysisCard data={filteredData} kpis={kpis} />

                {/* Top KPI row - 5 Cards (Investimento, CTR, CPC, ROAS, CPM) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                    <KPICard
                        title="Investimento"
                        value={kpis.totalSpend}
                        formattedValue={formatCurrency(kpis.totalSpend)}
                        icon={DollarSign}
                        color="default"
                    />
                    <KPICard
                        title="CTR"
                        value={kpis.ctr}
                        formattedValue={`${formatDecimal(kpis.ctr)}%`}
                        icon={Activity}
                        color="default"
                    />
                    <KPICard
                        title="CPC"
                        value={kpis.cpc}
                        formattedValue={formatCurrency(kpis.cpc)}
                        icon={Target}
                        color="default"
                    />
                    <KPICard
                        title="ROAS"
                        value={kpis.roas}
                        formattedValue={`${formatDecimal(kpis.roas)}x`}
                        icon={TrendingUp}
                        color="default"
                    />
                    <KPICard
                        title="CPM"
                        value={kpis.cpm}
                        formattedValue={formatCurrency(kpis.cpm)}
                        icon={BarChart3}
                        color="default"
                    />
                </div>

                {/* Middle: Performance Area Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-meli-text">Performance ao Longo do Tempo</h3>
                        <span className="text-xs text-meli-text-secondary bg-gray-100 px-3 py-1 rounded-full">
                            Clique nas métricas para alternar a visualização
                        </span>
                    </div>
                    <PerformanceChart data={filteredData} height={350} />
                </div>

                {/* Bottom Section: Funnel (left), Table (middle/right), Demographics (bottom right) */}
                <div className="grid grid-cols-12 gap-8">
                    {/* Funnel on the Left (Column span 3) */}
                    <div className="col-span-12 lg:col-span-3">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                            <TrapezoidFunnel steps={funnel} />
                        </div>
                    </div>

                    {/* Table and Demographics on the Right (Column span 9) */}
                    <div className="col-span-12 lg:col-span-9 space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-meli-text mb-6">Detalhamento de Campanhas</h3>
                            <CampaignTable data={filteredData} />
                        </div>

                        <div className="grid grid-cols-1">
                            <PerformanceDemographics />
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}

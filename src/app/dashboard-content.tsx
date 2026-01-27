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
    CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CampaignData, AggregatedKPIs, FunnelStep } from '@/types/campaign';
import { formatCurrency, formatDecimal, cn, parseDate } from '@/lib/utils';
import { PageLayout } from '@/components/layout/Sidebar';
import { KPICard } from '@/components/ui/KPICard';
import { VisualFunnel } from '@/components/dashboard/ConversionFunnel';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { CampaignTable } from '@/components/dashboard/CampaignTable';
import { PerformanceDemographics } from '@/components/dashboard/PerformanceDemographics';
import { calculateKPIs, calculateFunnel } from '@/lib/sheets';

interface DashboardContentProps {
    data: CampaignData[];
    kpis: AggregatedKPIs;
    funnel: FunnelStep[];
}

// Date filter options
const dateRangeOptions = [
    { label: 'Últimos 7 dias', days: 7 },
    { label: 'Últimos 14 dias', days: 14 },
    { label: 'Últimos 30 dias', days: 30 },
    { label: 'Últimos 60 dias', days: 60 },
    { label: 'Últimos 90 dias', days: 90 },
];

// Smart Analysis Component
function SmartAnalysisCard({ data, kpis }: { data: CampaignData[], kpis: AggregatedKPIs }) {
    const insights = useMemo(() => {
        const results: Array<{ type: 'success' | 'warning' | 'info', title: string, description: string }> = [];

        // Analyze ROAS
        if (kpis.roas >= 3) {
            results.push({
                type: 'success',
                title: 'ROAS Excelente',
                description: `Seu ROAS está em ${kpis.roas.toFixed(2)}x - para cada R$1 investido, você está retornando R$${kpis.roas.toFixed(2)}.`
            });
        } else if (kpis.roas < 1) {
            results.push({
                type: 'warning',
                title: 'ROAS Abaixo do Ideal',
                description: `Seu ROAS está em ${kpis.roas.toFixed(2)}x. Considere otimizar suas campanhas para melhorar o retorno.`
            });
        }

        // Analyze CTR
        if (kpis.ctr > 2) {
            results.push({
                type: 'success',
                title: 'CTR Acima da Média',
                description: `Taxa de cliques de ${kpis.ctr.toFixed(2)}% indica boa relevância dos anúncios.`
            });
        } else if (kpis.ctr < 0.5) {
            results.push({
                type: 'warning',
                title: 'CTR Baixo',
                description: `CTR de ${kpis.ctr.toFixed(2)}%. Considere revisar criativos e segmentação.`
            });
        }

        // Analyze CPC
        if (kpis.cpc < 1) {
            results.push({
                type: 'success',
                title: 'CPC Eficiente',
                description: `Custo por clique de ${formatCurrency(kpis.cpc)} está dentro de uma faixa eficiente.`
            });
        }

        // Top performing campaign
        const campaignPerformance = data.reduce((acc, item) => {
            if (!acc[item.campaign]) {
                acc[item.campaign] = { spend: 0, revenue: 0 };
            }
            acc[item.campaign].spend += item.spend;
            acc[item.campaign].revenue += item.action_values_omni_purchase;
            return acc;
        }, {} as Record<string, { spend: number, revenue: number }>);

        const topCampaign = Object.entries(campaignPerformance)
            .map(([name, data]) => ({ name, roas: data.spend > 0 ? data.revenue / data.spend : 0 }))
            .sort((a, b) => b.roas - a.roas)[0];

        if (topCampaign && topCampaign.roas > 0) {
            results.push({
                type: 'info',
                title: 'Destaque de Performance',
                description: `"${topCampaign.name}" é sua campanha com melhor ROAS: ${topCampaign.roas.toFixed(2)}x.`
            });
        }

        return results.slice(0, 4); // Max 4 insights
    }, [data, kpis]);

    const iconMap = {
        success: CheckCircle,
        warning: AlertCircle,
        info: Sparkles
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
    const [selectedRange, setSelectedRange] = useState(30);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    // Filter data by date range
    const filteredData = useMemo(() => {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - selectedRange);

        return data.filter(item => {
            const itemDate = parseDate(item.date);
            return itemDate >= startDate && itemDate <= today;
        });
    }, [data, selectedRange]);

    // Recalculate KPIs based on filtered data
    const kpis = useMemo(() => calculateKPIs(filteredData), [filteredData]);
    const funnel = useMemo(() => calculateFunnel(filteredData), [filteredData]);

    // Calculate date range display
    const dateRangeDisplay = useMemo(() => {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - selectedRange);

        const formatDate = (d: Date) => d.toLocaleDateString('pt-BR');
        return `(${formatDate(startDate)} - ${formatDate(today)})`;
    }, [selectedRange]);

    return (
        <PageLayout
            title="Visão Geral"
            subtitle="Acompanhamento de performance de mídia"
        >
            <div className="space-y-8">
                {/* Period Filter - Functional */}
                <div className="relative">
                    <button
                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                        className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 w-fit shadow-sm hover:border-meli-yellow hover:shadow-md transition-all cursor-pointer"
                    >
                        <Calendar className="w-5 h-5 text-meli-blue" />
                        <span className="text-sm font-semibold text-meli-text">
                            {dateRangeOptions.find(o => o.days === selectedRange)?.label || 'Selecione'}
                        </span>
                        <span className="text-xs text-meli-text-secondary">{dateRangeDisplay}</span>
                    </button>

                    {/* Dropdown */}
                    {isDatePickerOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 min-w-[200px]"
                        >
                            {dateRangeOptions.map((option) => (
                                <button
                                    key={option.days}
                                    onClick={() => {
                                        setSelectedRange(option.days);
                                        setIsDatePickerOpen(false);
                                    }}
                                    className={cn(
                                        'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors',
                                        selectedRange === option.days
                                            ? 'bg-meli-yellow/20 text-meli-blue font-semibold'
                                            : 'text-meli-text'
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </motion.div>
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
                            <VisualFunnel steps={funnel} />
                        </div>
                    </div>

                    {/* Table and Demographics on the Right (Column span 9) */}
                    <div className="col-span-12 lg:col-span-9 space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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

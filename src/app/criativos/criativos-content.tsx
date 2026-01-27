'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Image as ImageIcon,
    Eye,
    MousePointerClick,
    Percent,
    TrendingUp,
    Layers
} from 'lucide-react';
import { CampaignData } from '@/types/campaign';
import { getUniqueCreatives } from '@/lib/sheets';
import { formatNumber, formatCompactNumber, formatDecimal, cn } from '@/lib/utils';
import { PageLayout } from '@/components/layout/Sidebar';
import { CreativeCard } from '@/components/gallery/CreativeCard';
import { CreativeModal } from '@/components/gallery/CreativeModal';

interface CriativosContentProps {
    data: CampaignData[];
}

type FilterType = 'todos' | 'melhor_ctr' | 'melhor_cpm' | 'melhor_roas';

const filterTabs: { id: FilterType; label: string; icon?: React.ReactNode }[] = [
    { id: 'todos', label: 'Todos', icon: <Layers className="w-4 h-4" /> },
    { id: 'melhor_ctr', label: 'Melhor CTR', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'melhor_cpm', label: 'Melhor CPM', icon: <MousePointerClick className="w-4 h-4" /> },
    { id: 'melhor_roas', label: 'Melhor ROAS', icon: <Percent className="w-4 h-4" /> },
];

export function CriativosContent({ data }: CriativosContentProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('todos');

    // Get unique creatives (unified by ad_name)
    const creatives = useMemo(() => getUniqueCreatives(data), [data]);

    // Calculate KPIs for creatives
    const kpis = useMemo(() => {
        const totalImpressions = creatives.reduce((sum, c) => sum + c.impressions, 0);
        const totalClicks = creatives.reduce((sum, c) => sum + c.actions_link_click, 0);
        const totalSpend = creatives.reduce((sum, c) => sum + c.spend, 0);

        return {
            totalCreatives: creatives.length,
            totalImpressions,
            totalClicks,
            avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
            avgCpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
        };
    }, [creatives]);

    // Filter and sort creatives based on active filter
    const filteredCreatives = useMemo(() => {
        let result = [...creatives];

        switch (activeFilter) {
            case 'melhor_ctr':
                result.sort((a, b) => {
                    const ctrA = a.impressions > 0 ? a.actions_link_click / a.impressions : 0;
                    const ctrB = b.impressions > 0 ? b.actions_link_click / b.impressions : 0;
                    return ctrB - ctrA;
                });
                break;
            case 'melhor_cpm':
                result.sort((a, b) => {
                    const cpmA = a.impressions > 0 ? (a.spend / a.impressions) * 1000 : Infinity;
                    const cpmB = b.impressions > 0 ? (b.spend / b.impressions) * 1000 : Infinity;
                    return cpmA - cpmB; // Lower CPM is better
                });
                break;
            case 'melhor_roas':
                result.sort((a, b) => {
                    const roasA = a.spend > 0 ? a.action_values_omni_purchase / a.spend : 0;
                    const roasB = b.spend > 0 ? b.action_values_omni_purchase / b.spend : 0;
                    return roasB - roasA;
                });
                break;
            default:
                // Keep original order for "todos"
                break;
        }

        return result;
    }, [creatives, activeFilter]);

    const selectedCreative = selectedIndex !== null ? filteredCreatives[selectedIndex] : null;

    const handleOpenModal = (index: number) => {
        setSelectedIndex(index);
    };

    const handleCloseModal = () => {
        setSelectedIndex(null);
    };

    const handlePrevious = () => {
        if (selectedIndex !== null && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1);
        }
    };

    const handleNext = () => {
        if (selectedIndex !== null && selectedIndex < filteredCreatives.length - 1) {
            setSelectedIndex(selectedIndex + 1);
        }
    };

    return (
        <PageLayout
            title="Criativos - Geral"
            subtitle="Performance consolidada de todos os criativos"
        >
            <div className="space-y-6">
                {/* KPI Cards */}
                <motion.div
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Criativos Ativos */}
                    <div className="card p-4">
                        <p className="text-xs text-meli-text-secondary font-medium mb-1">
                            Criativos Ativos
                        </p>
                        <p className="text-2xl font-bold text-meli-text">
                            {kpis.totalCreatives}
                        </p>
                        <p className="text-xs text-meli-text-secondary mt-1">
                            Em todas as plataformas
                        </p>
                    </div>

                    {/* Impressões Total */}
                    <div className="card p-4">
                        <p className="text-xs text-meli-text-secondary font-medium mb-1">
                            Impressões Total
                        </p>
                        <p className="text-2xl font-bold text-meli-text">
                            {formatCompactNumber(kpis.totalImpressions)}
                        </p>
                        <p className="text-xs text-meli-text-secondary mt-1">
                            De todos os criativos
                        </p>
                    </div>

                    {/* Cliques Total */}
                    <div className="card p-4">
                        <p className="text-xs text-meli-text-secondary font-medium mb-1">
                            Cliques Total
                        </p>
                        <p className="text-2xl font-bold text-meli-text">
                            {formatCompactNumber(kpis.totalClicks)}
                        </p>
                        <p className="text-xs text-meli-text-secondary mt-1">
                            De todos os criativos
                        </p>
                    </div>

                    {/* CTR Médio */}
                    <div className="card p-4">
                        <p className="text-xs text-meli-text-secondary font-medium mb-1">
                            CTR Médio
                        </p>
                        <p className="text-2xl font-bold text-meli-blue">
                            {formatDecimal(kpis.avgCtr)}%
                        </p>
                        <p className="text-xs text-meli-success mt-1">
                            Melhor: {formatDecimal(
                                creatives.length > 0
                                    ? Math.max(...creatives.map(c => c.impressions > 0 ? (c.actions_link_click / c.impressions) * 100 : 0))
                                    : 0
                            )}%
                        </p>
                    </div>

                    {/* CPM Médio */}
                    <div className="card p-4">
                        <p className="text-xs text-meli-text-secondary font-medium mb-1">
                            CPM Médio
                        </p>
                        <p className="text-2xl font-bold text-meli-text">
                            R$ {formatDecimal(kpis.avgCpm)}
                        </p>
                        <p className="text-xs text-meli-success mt-1">
                            Melhor: R$ {formatDecimal(
                                creatives.length > 0
                                    ? Math.min(...creatives.filter(c => c.impressions > 0).map(c => (c.spend / c.impressions) * 1000))
                                    : 0
                            )}
                        </p>
                    </div>
                </motion.div>

                {/* Galeria Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="text-lg font-semibold text-meli-text mb-4">
                        Galeria de Criativos
                    </h3>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {filterTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveFilter(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                                    activeFilter === tab.id
                                        ? 'bg-meli-yellow text-meli-blue shadow-sm'
                                        : 'bg-white border border-gray-200 text-meli-text-secondary hover:border-meli-yellow hover:text-meli-text'
                                )}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Creative Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCreatives.map((creative, index) => (
                            <CreativeCard
                                key={creative.ad_name}
                                creative={creative}
                                onClick={() => handleOpenModal(index)}
                                index={index}
                                highlightMetric={
                                    activeFilter === 'melhor_ctr' ? 'ctr' :
                                        activeFilter === 'melhor_cpm' ? 'cpm' :
                                            activeFilter === 'melhor_roas' ? 'roas' :
                                                null
                                }
                            />
                        ))}
                    </div>
                </motion.div>
            </div>

            <CreativeModal
                creative={selectedCreative}
                allData={data}
                isOpen={selectedIndex !== null}
                onClose={handleCloseModal}
                onPrevious={handlePrevious}
                onNext={handleNext}
                hasPrevious={selectedIndex !== null && selectedIndex > 0}
                hasNext={selectedIndex !== null && selectedIndex < filteredCreatives.length - 1}
            />
        </PageLayout>
    );
}

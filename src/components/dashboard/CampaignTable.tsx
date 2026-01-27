'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronUp,
    ChevronDown,
    Search,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { CampaignData } from '@/types/campaign';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';

interface CampaignTableProps {
    data: CampaignData[];
    className?: string;
}

type SortKey = 'campaign' | 'source' | 'spend' | 'impressions' | 'clicks' | 'conversions' | 'roas';
type SortOrder = 'asc' | 'desc';

// Aggregate campaigns
function aggregateCampaigns(data: CampaignData[]) {
    const grouped = new Map<string, {
        campaign: string;
        source: string;
        spend: number;
        impressions: number;
        clicks: number;
        conversions: number;
        revenue: number;
    }>();

    data.forEach(item => {
        const key = `${item.campaign}-${item.source}`;
        const existing = grouped.get(key) || {
            campaign: item.campaign,
            source: item.source,
            spend: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0,
        };

        grouped.set(key, {
            ...existing,
            spend: existing.spend + item.spend,
            impressions: existing.impressions + item.impressions,
            clicks: existing.clicks + item.actions_link_click,
            conversions: existing.conversions + item.actions_offsite_conversion_fb_pixel_purchase,
            revenue: existing.revenue + item.action_values_omni_purchase,
        });
    });

    return Array.from(grouped.values()).map(item => ({
        ...item,
        roas: item.spend > 0 ? item.revenue / item.spend : 0,
    }));
}

export function CampaignTable({ data, className }: CampaignTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('spend');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const aggregatedData = useMemo(() => aggregateCampaigns(data), [data]);

    // Filter and sort
    const filteredData = useMemo(() => {
        let result = [...aggregatedData];

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(item =>
                item.campaign.toLowerCase().includes(searchLower) ||
                item.source.toLowerCase().includes(searchLower)
            );
        }

        // Sort
        result.sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortOrder === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            return sortOrder === 'asc'
                ? (aVal as number) - (bVal as number)
                : (bVal as number) - (aVal as number);
        });

        return result;
    }, [aggregatedData, search, sortKey, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('desc');
        }
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortKey !== column) return null;
        return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    };

    return (
        <motion.div
            className={cn('card overflow-hidden', className)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-meli-text">
                    Campanhas
                </h3>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-meli-text-secondary" />
                    <input
                        type="text"
                        placeholder="Buscar campanhas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-meli-yellow focus:ring-2 focus:ring-meli-yellow/20"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {[
                                { key: 'campaign' as SortKey, label: 'Campanha', width: 'min-w-[200px]' },
                                { key: 'source' as SortKey, label: 'Source', width: 'min-w-[100px]' },
                                { key: 'spend' as SortKey, label: 'Investimento', width: 'min-w-[120px]' },
                                { key: 'impressions' as SortKey, label: 'Impressões', width: 'min-w-[100px]' },
                                { key: 'clicks' as SortKey, label: 'Cliques', width: 'min-w-[80px]' },
                                { key: 'conversions' as SortKey, label: 'Conversões', width: 'min-w-[100px]' },
                                { key: 'roas' as SortKey, label: 'ROAS', width: 'min-w-[80px]' },
                            ].map(({ key, label, width }) => (
                                <th
                                    key={key}
                                    onClick={() => handleSort(key)}
                                    className={cn(
                                        'px-4 py-3 text-left text-sm font-semibold text-meli-text cursor-pointer hover:bg-gray-100 transition-colors',
                                        width
                                    )}
                                >
                                    <div className="flex items-center gap-1">
                                        {label}
                                        <SortIcon column={key} />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((item, index) => (
                            <motion.tr
                                key={`${item.campaign}-${item.source}`}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <td className="px-4 py-3">
                                    <span className="font-medium text-meli-text text-sm">
                                        {item.campaign}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        'badge',
                                        item.source === 'facebook' && 'badge-facebook',
                                        item.source === 'google' && 'badge-google',
                                        item.source === 'instagram' && 'badge-instagram'
                                    )}>
                                        {item.source}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-meli-text">
                                    {formatCurrency(item.spend)}
                                </td>
                                <td className="px-4 py-3 text-sm text-meli-text-secondary">
                                    {formatNumber(item.impressions)}
                                </td>
                                <td className="px-4 py-3 text-sm text-meli-text-secondary">
                                    {formatNumber(item.clicks)}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        'font-medium text-sm',
                                        item.conversions > 0 ? 'text-meli-success' : 'text-meli-text-secondary'
                                    )}>
                                        {formatNumber(item.conversions)}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        'font-semibold text-sm',
                                        item.roas >= 3 ? 'text-meli-success' :
                                            item.roas >= 1 ? 'text-meli-blue' :
                                                'text-meli-alert'
                                    )}>
                                        {item.roas.toFixed(2)}x
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                    <p className="text-sm text-meli-text-secondary">
                        Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page =>
                                page === 1 ||
                                page === totalPages ||
                                Math.abs(page - currentPage) <= 1
                            )
                            .map((page, index, array) => (
                                <>
                                    {index > 0 && array[index - 1] !== page - 1 && (
                                        <span key={`ellipsis-${page}`} className="px-2 text-meli-text-secondary">...</span>
                                    )}
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={cn(
                                            'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                                            currentPage === page
                                                ? 'bg-meli-yellow text-meli-blue'
                                                : 'hover:bg-gray-100 text-meli-text-secondary'
                                        )}
                                    >
                                        {page}
                                    </button>
                                </>
                            ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

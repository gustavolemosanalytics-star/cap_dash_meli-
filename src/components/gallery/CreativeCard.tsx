'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CampaignData } from '@/types/campaign';
import { formatNumber, formatCurrency, cn } from '@/lib/utils';
import { Eye, MousePointerClick, ImageIcon, TrendingUp, DollarSign, Target, Video, ShoppingBag } from 'lucide-react';

interface CreativeCardProps {
    creative: CampaignData;
    onClick: () => void;
    index?: number;
    highlightMetric?: 'ctr' | 'cpm' | 'roas' | 'sales' | null;
}

export function CreativeCard({ creative, onClick, index = 0, highlightMetric }: CreativeCardProps) {
    const ctr = creative.impressions > 0
        ? (creative.actions_link_click / creative.impressions * 100)
        : 0;
    const cpm = creative.impressions > 0
        ? (creative.spend / creative.impressions * 1000)
        : 0;
    const roas = creative.spend > 0
        ? (creative.action_values_omni_purchase / creative.spend)
        : 0;

    // Detect media type based on ad name
    const isVideo = creative.ad_name.toLowerCase().includes('video') ||
        creative.ad_name.toLowerCase().includes('reels') ||
        creative.ad_name.toLowerCase().includes('stories');

    // Get highlight badge content based on active filter
    const getHighlightBadge = () => {
        switch (highlightMetric) {
            case 'ctr':
                return {
                    icon: TrendingUp,
                    label: 'CTR',
                    value: `${ctr.toFixed(2)}%`,
                    color: 'bg-gradient-to-r from-green-500 to-emerald-600'
                };
            case 'cpm':
                return {
                    icon: DollarSign,
                    label: 'CPM',
                    value: `R$ ${cpm.toFixed(2)}`,
                    color: 'bg-gradient-to-r from-blue-500 to-indigo-600'
                };
            case 'roas':
                return {
                    icon: Target,
                    label: 'ROAS',
                    value: `${roas.toFixed(2)}x`,
                    color: 'bg-gradient-to-r from-purple-500 to-pink-600'
                };
            case 'sales':
                return {
                    icon: ShoppingBag,
                    label: 'Vendas',
                    value: formatCurrency(creative.action_values_omni_purchase),
                    color: 'bg-gradient-to-r from-orange-500 to-rose-600'
                };
            default:
                return null;
        }
    };

    const badge = getHighlightBadge();

    return (
        <motion.div
            className="card overflow-hidden cursor-pointer group"
            onClick={onClick}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-100 overflow-hidden">
                {/* Image type label */}
                <div className="absolute top-2 left-2 z-10">
                    <span className="bg-white/90 backdrop-blur-sm text-xs font-medium text-meli-text px-2 py-1 rounded flex items-center gap-1">
                        {isVideo ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        {isVideo ? 'Video' : 'Imagem'}
                    </span>
                </div>

                {/* Source badge */}
                <div className="absolute top-2 right-2 z-10">
                    <span className={cn(
                        'badge text-xs',
                        creative.source === 'facebook' && 'badge-facebook',
                        creative.source === 'google' && 'badge-google',
                        creative.source === 'instagram' && 'badge-instagram'
                    )}>
                        {creative.source.charAt(0).toUpperCase() + creative.source.slice(1)}
                    </span>
                </div>

                {/* Highlight metric badge (when filtering) */}
                {badge && (
                    <motion.div
                        className="absolute bottom-2 left-2 z-10"
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: index * 0.03 + 0.2 }}
                    >
                        <span className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs font-bold shadow-lg',
                            badge.color
                        )}>
                            <badge.icon className="w-3.5 h-3.5" />
                            <span>{badge.label}:</span>
                            <span className="font-extrabold">{badge.value}</span>
                        </span>
                    </motion.div>
                )}

                {creative.thumbnail_url ? (
                    <Image
                        src={creative.thumbnail_url}
                        alt={creative.ad_name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-meli-text-secondary">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
                        <span className="text-sm">Sem mídia</span>
                    </div>
                )}

                {/* Hover overlay */}
                <motion.div
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                >
                    <span className="text-white font-medium text-sm bg-meli-yellow px-4 py-2 rounded-full text-meli-blue">
                        Ver detalhes
                    </span>
                </motion.div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h4 className="font-medium text-meli-text text-sm line-clamp-2 mb-3 group-hover:text-meli-blue transition-colors min-h-[40px]">
                    {creative.ad_name}
                </h4>

                {/* Mini metrics */}
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-meli-text-secondary">
                        <div className="flex items-center gap-1" title="Impressões">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{formatNumber(creative.impressions)}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Compras">
                            <ShoppingBag className="w-3.5 h-3.5 text-meli-green" />
                            <span className="font-semibold text-meli-green">{formatNumber(creative.actions_offsite_conversion_fb_pixel_purchase)}</span>
                        </div>
                    </div>
                    <div className="font-semibold text-meli-blue">
                        {ctr.toFixed(2)}% CTR
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

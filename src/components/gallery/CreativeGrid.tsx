'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CampaignData } from '@/types/campaign';
import { getUniqueCreatives } from '@/lib/sheets';
import { CreativeCard } from './CreativeCard';
import { CreativeModal } from './CreativeModal';
import { cn } from '@/lib/utils';

interface CreativeGridProps {
    data: CampaignData[];
    className?: string;
}

export function CreativeGrid({ data, className }: CreativeGridProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    // Get unique creatives with aggregated metrics
    const creatives = useMemo(() => getUniqueCreatives(data), [data]);

    const selectedCreative = selectedIndex !== null ? creatives[selectedIndex] : null;

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
        if (selectedIndex !== null && selectedIndex < creatives.length - 1) {
            setSelectedIndex(selectedIndex + 1);
        }
    };

    return (
        <>
            <motion.div
                className={cn(
                    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
                    className
                )}
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 }
                    }
                }}
            >
                {creatives.map((creative, index) => (
                    <CreativeCard
                        key={`${creative.ad_name}-${creative.thumbnail_url}`}
                        creative={creative}
                        onClick={() => handleOpenModal(index)}
                        index={index}
                    />
                ))}
            </motion.div>

            <CreativeModal
                creative={selectedCreative}
                isOpen={selectedIndex !== null}
                onClose={handleCloseModal}
                onPrevious={handlePrevious}
                onNext={handleNext}
                hasPrevious={selectedIndex !== null && selectedIndex > 0}
                hasNext={selectedIndex !== null && selectedIndex < creatives.length - 1}
            />
        </>
    );
}

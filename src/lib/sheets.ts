import { CampaignData, AggregatedKPIs, FunnelStep, DemographicsData } from '@/types/campaign';
import { parseBrazilianNumber, parseDate } from './utils';

const SHEET_ID = '1jVBV7vPUuK2qZLevmjnHVlc62QasHcZdor0Hsib9xzA';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
const AGE_GENDER_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1`; // gid=1 for second sheet (meta age gender)

export async function fetchCampaignData(): Promise<CampaignData[]> {
    const response = await fetch(CSV_URL, { next: { revalidate: 300 } }); // Cache for 5 minutes
    const csvText = await response.text();

    return parseCSV(csvText);
}

function parseCSV(csvText: string): CampaignData[] {
    const lines = csvText.split('\r\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Skip header row
    const dataLines = lines.slice(1);

    return dataLines.map(line => {
        const values = parseCSVLine(line);

        return {
            campaign: values[0] || '',
            date: values[1] || '',
            source: values[2] || '',
            spend: parseBrazilianNumber(values[3]),
            impressions: parseInt(values[4]) || 0,
            actions_link_click: parseInt(values[5]) || 0,
            actions_landing_page_view: parseInt(values[6]) || 0,
            thumbnail_url: values[7] || '',
            ad_name: values[8] || '',
            actions_add_to_cart: parseInt(values[9]) || 0,
            actions_initiate_checkout: parseInt(values[10]) || 0,
            actions_offsite_conversion_fb_pixel_purchase: parseInt(values[11]) || 0,
            actions_post_engagement: parseInt(values[12]) || 0,
            adset_name: values[13] || '',
            action_values_omni_purchase: parseBrazilianNumber(values[14]),
        };
    });
}

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
}

export function calculateKPIs(data: CampaignData[]): AggregatedKPIs {
    const totals = data.reduce(
        (acc, item) => ({
            spend: acc.spend + item.spend,
            impressions: acc.impressions + item.impressions,
            clicks: acc.clicks + item.actions_link_click,
            landingPageViews: acc.landingPageViews + item.actions_landing_page_view,
            addToCart: acc.addToCart + item.actions_add_to_cart,
            initiateCheckout: acc.initiateCheckout + item.actions_initiate_checkout,
            purchases: acc.purchases + item.actions_offsite_conversion_fb_pixel_purchase,
            revenue: acc.revenue + item.action_values_omni_purchase,
        }),
        {
            spend: 0,
            impressions: 0,
            clicks: 0,
            landingPageViews: 0,
            addToCart: 0,
            initiateCheckout: 0,
            purchases: 0,
            revenue: 0,
        }
    );

    return {
        totalSpend: totals.spend,
        totalImpressions: totals.impressions,
        totalClicks: totals.clicks,
        totalLandingPageViews: totals.landingPageViews,
        totalAddToCart: totals.addToCart,
        totalInitiateCheckout: totals.initiateCheckout,
        totalPurchases: totals.purchases,
        totalRevenue: totals.revenue,
        ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
        cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
        cpm: totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0,
        roas: totals.spend > 0 ? totals.revenue / totals.spend : 0,
    };
}

export function calculateFunnel(data: CampaignData[]): FunnelStep[] {
    const kpis = calculateKPIs(data);

    const steps = [
        { name: 'Impressões', value: kpis.totalImpressions },
        { name: 'Cliques no Link', value: kpis.totalClicks },
        { name: 'Page View', value: kpis.totalLandingPageViews },
        { name: 'Add to Cart', value: kpis.totalAddToCart },
        { name: 'Initiate Checkout', value: kpis.totalInitiateCheckout },
        { name: 'Compra', value: kpis.totalPurchases },
    ];

    const maxValue = steps[0].value;

    return steps.map((step, index) => ({
        ...step,
        percentage: maxValue > 0 ? (step.value / maxValue) * 100 : 0,
        conversionFromPrevious: index > 0 && steps[index - 1].value > 0
            ? (step.value / steps[index - 1].value) * 100
            : 100,
    }));
}

export function filterData(
    data: CampaignData[],
    filters: {
        dateRange?: { start: Date; end: Date };
        sources?: string[];
        campaigns?: string[];
    }
): CampaignData[] {
    return data.filter(item => {
        // Filter by date range
        if (filters.dateRange) {
            const itemDate = parseDate(item.date);
            if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
                return false;
            }
        }

        // Filter by sources
        if (filters.sources && filters.sources.length > 0) {
            if (!filters.sources.includes(item.source)) {
                return false;
            }
        }

        // Filter by campaigns
        if (filters.campaigns && filters.campaigns.length > 0) {
            if (!filters.campaigns.includes(item.campaign)) {
                return false;
            }
        }

        return true;
    });
}

export function getUniqueSources(data: CampaignData[]): string[] {
    return [...new Set(data.map(item => item.source))];
}

export function getUniqueCampaigns(data: CampaignData[]): string[] {
    return [...new Set(data.map(item => item.campaign))];
}

export function getUniqueCreatives(data: CampaignData[]): CampaignData[] {
    const seen = new Map<string, CampaignData>();

    data.forEach(item => {
        // Group by ad_name only (unified by creative name)
        const key = item.ad_name;
        if (!seen.has(key)) {
            seen.set(key, { ...item });
        } else {
            // Aggregate metrics for same creative
            const existing = seen.get(key)!;
            seen.set(key, {
                ...existing,
                spend: existing.spend + item.spend,
                impressions: existing.impressions + item.impressions,
                actions_link_click: existing.actions_link_click + item.actions_link_click,
                actions_landing_page_view: existing.actions_landing_page_view + item.actions_landing_page_view,
                actions_add_to_cart: existing.actions_add_to_cart + item.actions_add_to_cart,
                actions_initiate_checkout: existing.actions_initiate_checkout + item.actions_initiate_checkout,
                actions_offsite_conversion_fb_pixel_purchase: existing.actions_offsite_conversion_fb_pixel_purchase + item.actions_offsite_conversion_fb_pixel_purchase,
                actions_post_engagement: existing.actions_post_engagement + item.actions_post_engagement,
                action_values_omni_purchase: existing.action_values_omni_purchase + item.action_values_omni_purchase,
            });
        }
    });

    return Array.from(seen.values());
}

// Group data by date for charts
export function groupByDate(data: CampaignData[]): Map<string, CampaignData[]> {
    const grouped = new Map<string, CampaignData[]>();

    data.forEach(item => {
        const existing = grouped.get(item.date) || [];
        grouped.set(item.date, [...existing, item]);
    });

    return grouped;
}

// Fetch demographics data from meta age gender sheet
export async function fetchDemographicsData(): Promise<DemographicsData[]> {
    try {
        const response = await fetch(AGE_GENDER_CSV_URL, { next: { revalidate: 300 } });
        const csvText = await response.text();
        return parseDemographicsCSV(csvText);
    } catch (error) {
        console.error('Error fetching demographics data:', error);
        return [];
    }
}

function parseDemographicsCSV(csvText: string): DemographicsData[] {
    const lines = csvText.split('\r\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Skip header row
    const dataLines = lines.slice(1);

    return dataLines.map(line => {
        const values = parseCSVLine(line);

        return {
            age: values[0] || '',
            gender: values[1] || '',
            impressions: parseInt(values[2]) || 0,
            clicks: parseInt(values[3]) || 0, // actions_link_clicks
            engagement: parseInt(values[4]) || 0, // actions_post_engagement
            purchases: parseInt(values[5]) || 0, // actions_offsite_conversion_fb_pixel_purchase
        };
    });
}

// Aggregate demographics by age group
export function aggregateDemographicsByAge(data: DemographicsData[]): {
    age: string;
    male: number;
    female: number;
}[] {
    const ageGroups = new Map<string, { male: number; female: number }>();

    data.forEach(item => {
        const existing = ageGroups.get(item.age) || { male: 0, female: 0 };

        if (item.gender.toLowerCase() === 'male' || item.gender.toLowerCase() === 'masculino') {
            existing.male += item.impressions;
        } else if (item.gender.toLowerCase() === 'female' || item.gender.toLowerCase() === 'feminino') {
            existing.female += item.impressions;
        }

        ageGroups.set(item.age, existing);
    });

    return Array.from(ageGroups.entries())
        .map(([age, data]) => ({ age, ...data }))
        .sort((a, b) => {
            const ageOrder = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
            return ageOrder.indexOf(a.age) - ageOrder.indexOf(b.age);
        });
}

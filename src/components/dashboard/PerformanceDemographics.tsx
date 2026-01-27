'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { cn } from '@/lib/utils';

type MetricType = 'impressions' | 'clicks' | 'engagement' | 'purchases';

const metricLabels: Record<MetricType, string> = {
    impressions: 'Impressões',
    clicks: 'Cliques',
    engagement: 'Engajamento',
    purchases: 'Compras'
};

interface DemographicsDataItem {
    age: string;
    gender: string;
    impressions: number;
    clicks: number;
    engagement: number;
    purchases: number;
}

const SHEET_ID = '1jVBV7vPUuK2qZLevmjnHVlc62QasHcZdor0Hsib9xzA';

export function PerformanceDemographics() {
    const [activeMetric, setActiveMetric] = useState<MetricType>('impressions');
    const [rawData, setRawData] = useState<DemographicsDataItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            setError(null);

            try {
                // Try to fetch from the second sheet (gid parameter)
                const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const csvText = await response.text();
                const lines = csvText.split(/\r?\n/).filter(line => line.trim());

                if (lines.length < 2) {
                    // No data, use mock
                    setRawData([]);
                    return;
                }

                // Parse CSV - skip header
                const dataLines = lines.slice(1);
                const parsedData: DemographicsDataItem[] = [];

                for (const line of dataLines) {
                    const values = parseCSVLine(line);
                    if (values.length >= 6) {
                        parsedData.push({
                            age: values[0] || '',
                            gender: values[1] || '',
                            impressions: parseInt(values[2]) || 0,
                            clicks: parseInt(values[3]) || 0,
                            engagement: parseInt(values[4]) || 0,
                            purchases: parseInt(values[5]) || 0,
                        });
                    }
                }

                setRawData(parsedData);
            } catch (err) {
                console.error('Error fetching demographics:', err);
                setError('Erro ao carregar dados');
                setRawData([]);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    // Parse CSV line handling quotes
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

    // Aggregate data by age and gender based on selected metric
    const demographicsData = useMemo(() => {
        // Default mock data if no real data available
        const mockData = [
            { age: '18-24', male: 4000, female: 2400 },
            { age: '25-34', male: 3000, female: 1398 },
            { age: '35-44', male: 2000, female: 9800 },
            { age: '45-54', male: 2780, female: 3908 },
            { age: '55-64', male: 1890, female: 4800 },
            { age: '65+', male: 2390, female: 3800 },
        ];

        if (rawData.length === 0) {
            return mockData;
        }

        const ageGroups = new Map<string, { male: number; female: number }>();

        rawData.forEach(item => {
            const existing = ageGroups.get(item.age) || { male: 0, female: 0 };
            const value = item[activeMetric];

            const genderLower = item.gender.toLowerCase();
            if (genderLower === 'male' || genderLower === 'masculino' || genderLower === 'm') {
                existing.male += value;
            } else if (genderLower === 'female' || genderLower === 'feminino' || genderLower === 'f') {
                existing.female += value;
            }

            ageGroups.set(item.age, existing);
        });

        const result = Array.from(ageGroups.entries())
            .map(([age, data]) => ({ age, ...data }))
            .sort((a, b) => {
                const ageOrder = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
                return ageOrder.indexOf(a.age) - ageOrder.indexOf(b.age);
            });

        return result.length > 0 ? result : mockData;
    }, [rawData, activeMetric]);

    return (
        <div className="card p-6 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-meli-text">Desempenho por Idade e Gênero</h3>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {(['impressions', 'clicks', 'engagement', 'purchases'] as MetricType[]).map((metric) => (
                        <button
                            key={metric}
                            onClick={() => setActiveMetric(metric)}
                            className={cn(
                                'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
                                activeMetric === metric
                                    ? 'bg-white text-meli-blue shadow-sm'
                                    : 'text-meli-text-secondary hover:text-meli-text'
                            )}
                        >
                            {metricLabels[metric]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-[300px]">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-meli-blue"></div>
                    </div>
                ) : error ? (
                    <div className="h-full flex items-center justify-center text-meli-text-secondary">
                        {error}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={demographicsData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="age"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#666', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#666', fontSize: 12 }}
                                tickFormatter={(value) => {
                                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                                    return value;
                                }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8f9fa' }}
                                contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                formatter={(value) => [(value as number).toLocaleString('pt-BR'), '']}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Bar
                                dataKey="male"
                                name="Masculino"
                                fill="#2D3277"
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                            />
                            <Bar
                                dataKey="female"
                                name="Feminino"
                                fill="#FFE600"
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

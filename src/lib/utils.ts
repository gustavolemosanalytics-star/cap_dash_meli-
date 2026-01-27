import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import numeral from "numeral";

// Configure numeral for pt-BR
numeral.register('locale', 'pt-br', {
    delimiters: {
        thousands: '.',
        decimal: ','
    },
    abbreviations: {
        thousand: 'mil',
        million: 'mi',
        billion: 'bi',
        trillion: 'tri'
    },
    ordinal: function () {
        return 'º';
    },
    currency: {
        symbol: 'R$'
    }
});
numeral.locale('pt-br');

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
    return numeral(value).format('$ 0,0.00');
}

export function formatNumber(value: number): string {
    return numeral(value).format('0,0');
}

export function formatCompactNumber(value: number): string {
    if (value >= 1000000) {
        return numeral(value).format('0.0a');
    }
    if (value >= 1000) {
        return numeral(value).format('0.0a');
    }
    return numeral(value).format('0,0');
}

export function formatPercentage(value: number): string {
    return numeral(value / 100).format('0.00%');
}

export function formatDecimal(value: number, decimals: number = 2): string {
    return value.toFixed(decimals).replace('.', ',');
}

// Parse Brazilian number format (1.234,56) to number
export function parseBrazilianNumber(value: string): number {
    if (!value || value === '') return 0;
    const cleaned = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}

// Parse date from DD/MM/YYYY format
export function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

// Format date for display
export function formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
}

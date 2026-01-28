// Campaign data types matching the Google Sheets structure
export interface CampaignData {
  campaign: string;
  date: string;
  source: string;
  spend: number;
  impressions: number;
  actions_link_click: number;
  actions_landing_page_view: number;
  thumbnail_url: string;
  ad_name: string;
  actions_add_to_cart: number;
  actions_initiate_checkout: number;
  actions_offsite_conversion_fb_pixel_purchase: number;
  actions_post_engagement: number;
  adset_name: string;
  action_values_omni_purchase: number;
}

// Calculated metrics for display
export interface CalculatedMetrics {
  ctr: number; // (clicks / impressions) * 100
  cpc: number; // spend / clicks
  cpm: number; // (spend / impressions) * 1000
  roas: number; // revenue / spend
  conversionRate: number; // purchases / clicks * 100
}

// Aggregated data for KPIs
export interface AggregatedKPIs {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalLandingPageViews: number;
  totalAddToCart: number;
  totalInitiateCheckout: number;
  totalPurchases: number;
  totalRevenue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  costPerPurchase: number;
}

// Funnel step data
export interface FunnelStep {
  name: string;
  value: number;
  percentage: number;
  conversionFromPrevious?: number;
}

// Creative data with calculated metrics
export interface CreativeData extends CampaignData {
  metrics: CalculatedMetrics;
}

// Filters
export interface Filters {
  dateRange: { start: Date; end: Date } | null;
  sources: string[];
  campaigns: string[];
}

// Demographics data from meta age gender sheet
export interface DemographicsData {
  age: string;
  gender: string;
  impressions: number;
  clicks: number;
  engagement: number;
  purchases: number;
}

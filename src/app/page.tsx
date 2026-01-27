import { fetchCampaignData, calculateKPIs, calculateFunnel } from '@/lib/sheets';
import { DashboardContent } from './dashboard-content';

export const revalidate = 300; // Revalidate every 5 minutes

export default async function DashboardPage() {
  const data = await fetchCampaignData();
  const kpis = calculateKPIs(data);
  const funnel = calculateFunnel(data);

  return (
    <DashboardContent
      data={data}
      kpis={kpis}
      funnel={funnel}
    />
  );
}

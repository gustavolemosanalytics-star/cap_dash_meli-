import { fetchCampaignData } from '@/lib/sheets';
import { CriativosContent } from './criativos-content';

export const revalidate = 300;

export default async function CriativosPage() {
    const data = await fetchCampaignData();

    return <CriativosContent data={data} />;
}

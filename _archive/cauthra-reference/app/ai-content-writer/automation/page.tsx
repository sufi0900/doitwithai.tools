import type { Metadata } from 'next';
import AutonomousCampaignDashboard from '@/features/autonomous-campaign-studio/AutonomousCampaignDashboard';

export const metadata: Metadata = {
  title: 'Autonomous Content, Visual & Social Agent OS | DoItWithAI.tools',
  description:
    'Plan, generate, visualize, and schedule 1-to-15 SEO/GEO articles, 6-layer infographics, and 2:3 Pinterest Pins with zero compulsory sign-in using localStorage.',
};

export default function AutonomousContentAutomationPage() {
  return <AutonomousCampaignDashboard />;
}

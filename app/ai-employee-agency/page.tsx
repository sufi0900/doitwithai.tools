import type { Metadata } from 'next';
import AiAgencyPublicLanding from '@/features/ai-employee-agency/AiAgencyPublicLanding';

export const metadata: Metadata = {
  title:
    '24/7 Active AI Employee Agency — Autonomous SEO, Content, Visual & Social OS | DoItWithAI.tools',
  description:
    'Enter your Website URL once and hire a 24/7 Autonomous AI Digital Agency. 8 AI Department Managers and 24 Sub-Agents automate Keyword Research, Content Writing, 6-Layer Infographics, On-Page/Off-Page/Technical SEO, and Pinterest, LinkedIn & TikTok scripts.',
  alternates: {
    canonical: 'https://doitwithai.tools/ai-employee-agency',
  },
};

export default function AiEmployeeAgencyLandingPage() {
  return <AiAgencyPublicLanding />;
}

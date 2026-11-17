import type { Metadata } from 'next';
import AiAgencyDashboardShell from '@/features/ai-employee-agency/AiAgencyDashboardShell';

export const metadata: Metadata = {
  title:
    '24/7 AI Digital Agency Live Dashboard — 8 Departments & Interactive Node Graph | DoItWithAI.tools',
  description:
    'Live 24/7 AI Employee Agency Workspace featuring 8 specialized SEO, Content, Visual & Social Departments, a Full-Canvas Interactive Pan/Zoom Node Graph, and a Unified Founder Chat & Voice Command Bar.',
  alternates: {
    canonical: 'https://doitwithai.tools/ai-employee-agency/dashboard',
  },
};

export default function AiEmployeeAgencyDashboardPage() {
  return <AiAgencyDashboardShell />;
}

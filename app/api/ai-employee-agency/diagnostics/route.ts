import { NextResponse } from 'next/server';
import { providerBindings } from '@/lib/ai-employee-agency/llm-gateway';
export const dynamic = 'force-dynamic';
export function GET() {
  return NextResponse.json({ configured: providerBindings() }, { headers: { 'Cache-Control': 'no-store' } });
}

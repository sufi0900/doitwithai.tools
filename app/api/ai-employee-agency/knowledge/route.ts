import { NextResponse } from 'next/server';
import { agencyWorkspace } from '@/lib/ai-employee-agency/workspace.server';
import { discoverKnowledge } from '@/lib/ai-employee-agency/onboarding.server';
import { createSupabaseServiceClient } from '@/features/website-builder/lib/supabase/server';

export async function POST(request: Request) {
  const workspace = await agencyWorkspace(request);
  if (workspace instanceof NextResponse) return workspace;
  const input = await request.json().catch(() => null);
  const { data: row, error } = await workspace.db
    .from('tenant_brand_dna')
    .select('*')
    .eq('workspace_id', workspace.id)
    .maybeSingle();
  if (error || !row) return NextResponse.json({ error: 'Register a website first.' }, { status: 409 });
  if (row.revision !== input?.revision) {
    return NextResponse.json({ error: 'The knowledge base changed. Reload the review.' }, { status: 409 });
  }
  const admin = createSupabaseServiceClient();
  if (!admin) return NextResponse.json({ error: 'Workspace storage unavailable.' }, { status: 503 });
  let profile = { ...row.profile };
  let approved: string | null = null;

  if (input.action === 'discover' || input.action === 'rescan') {
    try {
      const fresh = await discoverKnowledge(row.domain, workspace.id, workspace.db);
      const keepApproved = input.action === 'rescan' && Boolean(row.approved_at);
      profile = {
        ...profile,
        ...fresh,
        name: profile.name || fresh.name,
        industry: profile.industry || fresh.industry,
        audience: profile.audience || fresh.audience,
        offer: profile.offer || fresh.offer,
        goal: profile.goal || '',
        locale: profile.locale || fresh.locale,
        currency: profile.currency || fresh.currency,
        live_sitemap_urls: (fresh.pages || []).map((page: { url: string; title: string }) => ({
          ...page,
          last_checked: fresh.checkedAt,
          type: /\/blog\//.test(page.url)
            ? 'blog'
            : /\/products?\//.test(page.url)
              ? 'product'
              : /\/services?\//.test(page.url)
                ? 'service'
                : 'core',
        })),
      };
      approved = keepApproved ? row.approved_at : null;
    } catch {
      return NextResponse.json(
        { error: 'Website discovery failed. Check the registered URL and connection.' },
        { status: 422 },
      );
    }
  } else if (input.action === 'approve' && profile.checkedAt) {
    for (const key of ['name', 'industry', 'audience', 'offer', 'goal', 'locale', 'currency']) {
      if (typeof input[key] !== 'string' || input[key].length > 500) {
        return NextResponse.json({ error: 'Invalid brand brief.' }, { status: 400 });
      }
      profile[key] = input[key].trim();
    }
    if (!profile.name || !profile.industry || !profile.audience) {
      return NextResponse.json({ error: 'Enter the business name, industry and audience.' }, { status: 400 });
    }
    profile.humanReview =
      input.humanReview === true ||
      /\b(medical|clinic|financial|finance|legal|lawyer|healthcare)\b/i.test(
        [profile.industry, ...(profile.headings || [])].join(' '),
      );
    const field = (key: string) => (typeof input[key] === 'string' ? input[key].trim().slice(0, 500) : '');
    const list = (key: string) =>
      field(key)
        .split(',')
        .map((v: string) => v.trim())
        .filter(Boolean);
    profile.business_model = ['b2b_saas', 'ecommerce', 'local_service', 'publisher', 'agency'].includes(
      input.business_model,
    )
      ? input.business_model
      : null;
    profile.reading_grade_target = ['grade_7_9', 'grade_10_12', 'executive'].includes(
      input.reading_grade_target,
    )
      ? input.reading_grade_target
      : null;
    profile.sub_niche = field('sub_niche');
    profile.out_of_scope_topics = list('out_of_scope_topics');
    profile.brand_voice = list('brand_voice');
    profile.competitor_blocklist = list('competitor_blocklist').map((domain: string) => domain.toLowerCase());
    if (field('ctaUrl') && !/^https?:\/\//i.test(field('ctaUrl'))) {
      return NextResponse.json({ error: 'Use an HTTP or HTTPS CTA destination.' }, { status: 400 });
    }
    profile.primary_cta = { label: field('ctaLabel'), target_url: field('ctaUrl') };
    profile.brand_colors = {
      primary: profile.colors?.[0] || null,
      secondary: profile.colors?.[1] || null,
      accent: profile.colors?.[2] || null,
    };
    profile.typography = { heading: profile.fonts?.[0] || null, body: profile.fonts?.[1] || null };
    profile.site_type = profile.source;
    profile.workspace_id = workspace.id;
    profile.domain = row.domain;
    profile.target_audience = profile.audience;
    profile.domain_maturity =
      (profile.pages?.length || 0) >= 15
        ? 'established_site'
        : profile.coverage === 'complete'
          ? 'new_site'
          : null;
    profile.is_ymyl = profile.humanReview;
    profile.strategy_bus_version = 1;
    profile.live_sitemap_urls = (profile.pages || []).map((page: { url: string; title: string }) => ({
      ...page,
      last_checked: profile.checkedAt,
      type: /\/blog\//.test(page.url)
        ? 'blog'
        : /\/products?\//.test(page.url)
          ? 'product'
          : /\/services?\//.test(page.url)
            ? 'service'
            : 'core',
    }));
    approved = new Date().toISOString();
  } else {
    return NextResponse.json({ error: 'Discover the website before approving it.' }, { status: 400 });
  }

  const saved = await admin
    .from('tenant_brand_dna')
    .update({ profile, approved_at: approved })
    .eq('workspace_id', workspace.id)
    .eq('revision', row.revision)
    .select('revision')
    .maybeSingle();
  if (saved.error || !saved.data) {
    return NextResponse.json({ error: 'Review changed or could not be saved. Reload it.' }, { status: 409 });
  }
  return NextResponse.json({
    ok: true,
    revision: saved.data.revision,
    pagesFound: Array.isArray(profile.pages) ? profile.pages.length : 0,
    coverage: profile.coverage || 'manual',
  });
}

import { NextResponse } from 'next/server';
import { agencyWorkspace } from '@/lib/ai-employee-agency/workspace.server';
import { discoverKnowledge } from '@/lib/ai-employee-agency/onboarding.server';
import {
  classifySiteMaturity,
  topicDecision,
  type AgencyPriorityPreset,
  type SiteKnowledge,
} from '@/lib/ai-employee-agency/site-knowledge';
import { createSupabaseServiceClient } from '@/features/website-builder/lib/supabase/server';

const VALID_PRESETS: AgencyPriorityPreset[] = [
  'growth_launch',
  'balanced_scale',
  'optimization_sprint',
];

export async function POST(request: Request) {
  const workspace = await agencyWorkspace(request);
  if (workspace instanceof NextResponse) return workspace;
  const input = await request.json().catch(() => null);
  const { data: row, error } = await workspace.db
    .from('tenant_brand_dna')
    .select('*')
    .eq('workspace_id', workspace.id)
    .maybeSingle();
  if (error || !row) {
    return NextResponse.json({ error: 'Register a website first.' }, { status: 409 });
  }
  if (row.revision !== input?.revision) {
    return NextResponse.json(
      { error: 'The knowledge base changed. Reload the review.' },
      { status: 409 },
    );
  }
  const admin = createSupabaseServiceClient();
  if (!admin) {
    return NextResponse.json({ error: 'Workspace storage unavailable.' }, { status: 503 });
  }
  let profile = { ...row.profile };
  let approved: string | null = null;

  if (input.action === 'discover' || input.action === 'rescan') {
    try {
      const fresh = await discoverKnowledge(row.domain, workspace.id, workspace.db);
      const keepApproved = input.action === 'rescan' && Boolean(row.approved_at);
      profile = {
        ...profile,
        ...fresh,
        name: (keepApproved && profile.name) || fresh.name,
        industry: (keepApproved && profile.industry) || fresh.industry,
        audience: (keepApproved && profile.audience) || fresh.audience,
        offer: (keepApproved && profile.offer) || fresh.offer,
        goal: profile.goal || fresh.goal || '',
        locale: (keepApproved && profile.locale) || fresh.locale,
        currency: (keepApproved && profile.currency) || fresh.currency,
        sub_niche: (keepApproved && profile.sub_niche) || fresh.sub_niche,
        business_model: (keepApproved && profile.business_model) || fresh.business_model,
        brand_voice:
          keepApproved && Array.isArray(profile.brand_voice) && profile.brand_voice.length > 0
            ? profile.brand_voice
            : fresh.brand_voice,
        domain_maturity: fresh.domain_maturity,
        priority_preset:
          keepApproved && VALID_PRESETS.includes(profile.priority_preset)
            ? profile.priority_preset
            : fresh.priority_preset,
        asset_inventory: fresh.asset_inventory,
        suggestedKeywords: fresh.suggestedKeywords || [],
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
      if (input[key] !== undefined) {
        if (typeof input[key] !== 'string' || input[key].length > 500) {
          return NextResponse.json({ error: 'Invalid brand brief.' }, { status: 400 });
        }
        profile[key] = input[key].trim();
      } else if (typeof profile[key] === 'string') {
        profile[key] = profile[key].trim();
      } else {
        profile[key] = '';
      }
    }
    if (!profile.name || !profile.industry || !profile.audience) {
      return NextResponse.json(
        { error: 'Enter the business name, industry and audience.' },
        { status: 400 },
      );
    }
    profile.humanReview =
      input.humanReview === true ||
      /\b(medical|clinic|financial|finance|legal|lawyer|healthcare)\b/i.test(
        [profile.industry, ...(profile.headings || [])].join(' '),
      );
    const field = (key: string) =>
      typeof input[key] === 'string'
        ? input[key].trim().slice(0, 500)
        : typeof profile[key] === 'string'
          ? profile[key].trim().slice(0, 500)
          : '';
    const list = (key: string) => {
      if (typeof input[key] === 'string') {
        return input[key]
          .trim()
          .slice(0, 500)
          .split(',')
          .map((v: string) => v.trim())
          .filter(Boolean);
      }
      return Array.isArray(profile[key]) ? profile[key] : [];
    };

    const incomingModel =
      typeof input.business_model === 'string' ? input.business_model : profile.business_model;
    profile.business_model = [
      'b2b_saas',
      'ecommerce',
      'local_service',
      'publisher',
      'agency',
    ].includes(incomingModel)
      ? incomingModel
      : null;

    const incomingGrade =
      typeof input.reading_grade_target === 'string'
        ? input.reading_grade_target
        : profile.reading_grade_target;
    profile.reading_grade_target = ['grade_7_9', 'grade_10_12', 'executive'].includes(incomingGrade)
      ? incomingGrade
      : null;

    profile.sub_niche = field('sub_niche');
    profile.out_of_scope_topics = list('out_of_scope_topics');
    profile.brand_voice = list('brand_voice');
    profile.competitor_blocklist = list('competitor_blocklist').map((domain: string) =>
      domain.toLowerCase(),
    );

    const ctaUrl =
      typeof input.ctaUrl === 'string'
        ? input.ctaUrl.trim().slice(0, 500)
        : profile.primary_cta?.target_url || '';
    const ctaLabel =
      typeof input.ctaLabel === 'string'
        ? input.ctaLabel.trim().slice(0, 500)
        : profile.primary_cta?.label || '';
    if (ctaUrl && !/^https?:\/\//i.test(ctaUrl)) {
      return NextResponse.json(
        { error: 'Use an HTTP or HTTPS CTA destination.' },
        { status: 400 },
      );
    }
    profile.primary_cta = { label: ctaLabel, target_url: ctaUrl };
    profile.brand_colors = {
      primary: profile.colors?.[0] || null,
      secondary: profile.colors?.[1] || null,
      accent: profile.colors?.[2] || null,
    };
    profile.typography = {
      heading: profile.fonts?.[0] || null,
      body: profile.fonts?.[1] || null,
    };
    profile.site_type = profile.source;
    profile.workspace_id = workspace.id;
    profile.domain = row.domain;
    profile.target_audience = profile.audience;

    const maturity = classifySiteMaturity(Array.isArray(profile.pages) ? profile.pages : []);
    profile.domain_maturity = maturity.domain_maturity;
    profile.asset_inventory = maturity.asset_inventory;
    profile.priority_preset = VALID_PRESETS.includes(input.priority_preset)
      ? input.priority_preset
      : VALID_PRESETS.includes(profile.priority_preset)
        ? profile.priority_preset
        : maturity.priority_preset;

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
    return NextResponse.json(
      { error: 'Discover the website before approving it.' },
      { status: 400 },
    );
  }

  const saved = await admin
    .from('tenant_brand_dna')
    .update({ profile, approved_at: approved })
    .eq('workspace_id', workspace.id)
    .eq('revision', row.revision)
    .select('revision')
    .maybeSingle();
  if (saved.error || !saved.data) {
    return NextResponse.json(
      { error: 'Review changed or could not be saved. Reload it.' },
      { status: 409 },
    );
  }

  const queuedTopicIds: string[] = [];
  if (
    input.action === 'approve' &&
    Array.isArray(input.selectedKeywords) &&
    input.selectedKeywords.length > 0
  ) {
    const cleanKeywords = input.selectedKeywords
      .filter((k: unknown): k is string => typeof k === 'string' && k.trim().length > 2)
      .map((k: string) => k.trim().slice(0, 240))
      .slice(0, 10);
    for (const topic of cleanKeywords) {
      const decision = topicDecision(topic, profile as SiteKnowledge);
      const kind = decision.action === 'refresh' ? 'refresh' : 'create';
      const queued = await admin.rpc('agency_queue_reviewed_topic', {
        owner: workspace.id,
        version: saved.data.revision,
        item: {
          topic,
          kind,
          target: kind === 'refresh' ? decision.match?.url || null : null,
          inventoryCoverage: decision.inventoryCoverage,
          brandRevision: saved.data.revision,
        },
      });
      if (!queued.error && typeof queued.data === 'string') {
        queuedTopicIds.push(queued.data);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    revision: saved.data.revision,
    pagesFound: Array.isArray(profile.pages) ? profile.pages.length : 0,
    coverage: profile.coverage || 'manual',
    domainMaturity: profile.domain_maturity || 'new_site',
    priorityPreset: profile.priority_preset || 'growth_launch',
    assetInventory: profile.asset_inventory || null,
    suggestedKeywordsCount: Array.isArray(profile.suggestedKeywords)
      ? profile.suggestedKeywords.length
      : 0,
    queuedTopicIds,
  });
}

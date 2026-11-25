import { requireApprovedWebsite, agencyWorkspace } from '@/lib/ai-employee-agency/workspace.server';
import { NextRequest, NextResponse } from 'next/server';
import { deliverApprovedArticle } from '@/lib/ai-agency/delivery.server';
import type { CmsConnectionConfig } from '@/lib/ai-employee-agency/cms-connectors';

interface PublishCmsRequestBody {
  config?: CmsConnectionConfig;
  reviewId?: string;
}

export async function POST(req: NextRequest) {
  const workspace = await agencyWorkspace(req);
  if (workspace instanceof NextResponse) return workspace;
  const blocked = await requireApprovedWebsite(workspace);
  if (blocked) return blocked;
  try {
    const body = (await req.json().catch(() => ({}))) as PublishCmsRequestBody;
    const config: CmsConnectionConfig = body.config || {
      platformId: 'wordpress-rest',
      siteUrl: 'https://doitwithai.tools',
      autoPublishMode: 'stage-as-draft',
    };

    if (!body.reviewId) return NextResponse.json({error:'Select a signed-off QA review before CMS delivery.'},{status:409});
    return await deliverApprovedArticle(workspace.id,body.reviewId,config);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to execute CMS auto-publish connector.',
      },
      { status: 500 }
    );
  }
}

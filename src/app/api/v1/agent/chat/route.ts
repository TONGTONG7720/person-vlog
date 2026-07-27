import { NextResponse } from 'next/server';

import { authorizeEnterpriseGatewayRequest } from '@/server/enterprise/gateway-service';
import { authenticateAiApiKey } from '@/server/saas/ai-api-keys';
import { saasApiErrorResponse } from '@/server/saas/api';
import { AiApiAuthenticationError } from '@/server/saas/ai-platform-errors';
import { runMarketplaceAgent } from '@/server/marketplace/developer-api';
import { developerAgentChatRequestSchema } from '@/server/marketplace/validation';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: '请求内容无法读取。' }, { status: 400 });
    }

    throw error;
  }

  const parsed = developerAgentChatRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: 'agentId 或 message 不符合接口要求。' }, { status: 400 });
  }

  try {
    const identity = await authenticateAiApiKey(request);

    if (identity === undefined) {
      throw new AiApiAuthenticationError();
    }

    authorizeEnterpriseGatewayRequest(identity, 'agent.execute');

    const response = await runMarketplaceAgent({
      agentId: parsed.data.agentId,
      apiKeyId: identity.id,
      message: parsed.data.message,
      organizationId: identity.organizationId,
    });

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

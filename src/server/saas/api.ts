import { NextResponse } from 'next/server';

import {
  EnterpriseGatewayRateLimitError,
  EnterpriseGatewayScopeError,
  EnterpriseSsoConfigurationError,
} from '@/server/enterprise/errors';
import { getSaasContext, SaasPermissionError, type SaasContext } from '@/server/saas/auth';
import {
  BillingConfigurationError,
  BillingPlanUnavailableError,
  BillingSubscriptionChangeUnavailableError,
  PlanFeatureUnavailableError,
  PlanLimitExceededError,
} from '@/server/saas/billing/billing-errors';
import { ProjectFileStorageError } from '@/server/saas/file-storage';
import {
  AiApiAuthenticationError,
  AiPlatformInputError,
  AiPlatformModelUnavailableError,
} from '@/server/saas/ai-platform-errors';
import { AiNativeAppStateError } from '@/server/saas/ai-native-app-errors';
import { SaasResourceNotFoundError } from '@/server/saas/project-errors';
import {
  MarketplaceInputError,
  MarketplaceRateLimitError,
  MarketplaceStateError,
} from '@/server/marketplace/errors';

type SaasApiContextResult =
  | Readonly<{ readonly context: SaasContext; readonly kind: 'authorized' }>
  | Readonly<{ readonly kind: 'unauthorized'; readonly response: NextResponse }>;

export async function getSaasApiContext(request: Request): Promise<SaasApiContextResult> {
  const organizationSlug = new URL(request.url).searchParams.get('organization') ?? undefined;
  const context = await getSaasContext(organizationSlug);

  return context === undefined
    ? {
        kind: 'unauthorized',
        response: NextResponse.json({ message: '请先登录客户门户。' }, { status: 401 }),
      }
    : { context, kind: 'authorized' };
}

export function saasApiErrorResponse(error: unknown): NextResponse {
  if (error instanceof EnterpriseGatewayScopeError) {
    return NextResponse.json(
      { message: '当前 API Key 未获授该接口所需的最小权限。' },
      { status: 403 },
    );
  }

  if (error instanceof EnterpriseGatewayRateLimitError) {
    return NextResponse.json(
      { message: '企业 API Gateway 请求过于频繁，请稍后重试。' },
      {
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((error.resetAt - Date.now()) / 1_000))),
        },
        status: 429,
      },
    );
  }

  if (error instanceof EnterpriseSsoConfigurationError) {
    return NextResponse.json({ message: error.message }, { status: 409 });
  }

  if (error instanceof AiApiAuthenticationError) {
    return NextResponse.json({ message: 'AI API Key 无效或已撤销。' }, { status: 401 });
  }

  if (error instanceof AiPlatformInputError) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (error instanceof AiNativeAppStateError) {
    return NextResponse.json({ message: error.message }, { status: 409 });
  }

  if (error instanceof AiPlatformModelUnavailableError) {
    return NextResponse.json({ message: '企业 AI 模型暂时未配置或不可用。' }, { status: 503 });
  }

  if (error instanceof MarketplaceInputError) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (error instanceof MarketplaceStateError) {
    return NextResponse.json({ message: error.message }, { status: 409 });
  }

  if (error instanceof MarketplaceRateLimitError) {
    return NextResponse.json(
      { message: 'Marketplace API 请求过于频繁，请稍后重试。' },
      { status: 429 },
    );
  }

  if (error instanceof SaasPermissionError) {
    return NextResponse.json({ message: '当前成员没有执行此操作的权限。' }, { status: 403 });
  }

  if (error instanceof SaasResourceNotFoundError) {
    return NextResponse.json({ message: '当前企业空间中不存在该资源。' }, { status: 404 });
  }

  if (error instanceof ProjectFileStorageError) {
    return NextResponse.json({ message: '项目文件存储尚未配置。' }, { status: 503 });
  }

  if (error instanceof BillingConfigurationError) {
    return NextResponse.json({ message: '账单服务尚未配置。' }, { status: 503 });
  }

  if (error instanceof BillingPlanUnavailableError) {
    return NextResponse.json({ message: '所选套餐暂时不可用。' }, { status: 409 });
  }

  if (error instanceof BillingSubscriptionChangeUnavailableError) {
    return NextResponse.json({ message: '当前付费套餐请联系支持人员协助变更。' }, { status: 409 });
  }

  if (error instanceof PlanFeatureUnavailableError) {
    return NextResponse.json({ message: '当前套餐未包含此功能，请升级后再试。' }, { status: 403 });
  }

  if (error instanceof PlanLimitExceededError) {
    return NextResponse.json(
      { message: '当前套餐的使用额度已用完，请升级后再试。' },
      { status: 429 },
    );
  }

  return NextResponse.json({ message: '暂时无法完成该操作。' }, { status: 500 });
}

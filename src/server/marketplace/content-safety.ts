import { isSafeAiAutomationInput } from '@/ai/lib/automation-safety';
import { MarketplaceInputError } from '@/server/marketplace/errors';

type MarketplaceSafetyInput = Readonly<{
  readonly description: string;
  readonly manifest: Record<string, unknown>;
  readonly title: string;
}>;

export function requireSafeMarketplaceContent(input: MarketplaceSafetyInput): void {
  const content = [input.title, input.description, JSON.stringify(input.manifest)].join('\n');

  if (!isSafeAiAutomationInput(content)) {
    throw new MarketplaceInputError('提交内容未通过基础安全检查，请移除恶意指令、密钥或敏感数据。');
  }
}

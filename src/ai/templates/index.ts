import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { ProposalTemplateId } from '@/ai/agents/proposal-agent';

const templateDirectory = join(process.cwd(), 'src', 'ai', 'templates');
const templateFileNames = {
  'ai-product': 'ai-product.md',
  automation: 'automation.md',
  'enterprise-system': 'enterprise-system.md',
  website: 'website.md',
} as const satisfies Readonly<Record<ProposalTemplateId, string>>;

export async function getProposalTemplate(templateId: ProposalTemplateId): Promise<string> {
  return readFile(join(templateDirectory, templateFileNames[templateId]), 'utf8');
}

import { z } from 'zod';

import { contentCategoryIds } from '@/config/content';
import { contentWriterOperations } from '@/ai/prompts/content';

export const contentWriterRequestSchema = z
  .object({
    category: z.enum(contentCategoryIds),
    content: z.string().trim().max(30_000),
    description: z.string().trim().max(500),
    keywords: z.array(z.string().trim().min(1).max(80)).max(16),
    operation: z.enum(contentWriterOperations),
    title: z.string().trim().min(2).max(160),
  })
  .strict();

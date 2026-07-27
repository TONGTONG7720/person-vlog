import { aiAppTemplateDefinitions } from '@/ai/app-templates/catalog';
import type { PrismaClient } from '@/generated/prisma/client';
import { toAiNativeAppJsonInput } from '@/server/saas/ai-native-app-json';

export async function ensureAiNativeAppTemplates(database: PrismaClient): Promise<void> {
  await Promise.all(
    aiAppTemplateDefinitions.map((template, sortOrder) =>
      database.aiAppTemplate.upsert({
        create: {
          blocks: toAiNativeAppJsonInput(template.blocks),
          category: template.category,
          config: toAiNativeAppJsonInput(template.config),
          description: template.description,
          key: template.key,
          name: template.name,
          sortOrder,
          type: template.type,
          workflow: toAiNativeAppJsonInput(template.workflow),
        },
        update: {},
        where: { key: template.key },
      }),
    ),
  );
}

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';

import { blogPosts } from '../src/content/blog/posts';
import { projects } from '../src/data/projects';
import { services } from '../src/data/services';
import { ensureAiAutomationDefaults } from '../src/server/ai/defaults';
import { ensureSaasDefaults } from '../src/server/saas/defaults';
import {
  AutomationRuleAction,
  AutomationRuleTrigger,
  KnowledgeSyncStatus,
  PrismaClient,
  ProjectStatus,
} from '../src/generated/prisma/client';

const databaseUrl = requireEnvironmentValue(
  process.env['DATABASE_URL'],
  'DATABASE_URL is required before seeding the CMS.',
);
const adminEmail = requireEnvironmentValue(
  process.env['ADMIN_EMAIL'],
  'ADMIN_EMAIL is required before seeding the CMS.',
).toLocaleLowerCase('zh-CN');
const configuredPasswordHash = process.env['ADMIN_PASSWORD_HASH']?.trim();
const temporaryAdminPassword = process.env['ADMIN_PASSWORD']?.trim();

if (
  (configuredPasswordHash === undefined || configuredPasswordHash === '') &&
  (temporaryAdminPassword === undefined || temporaryAdminPassword.length < 8)
) {
  throw new Error(
    'Set ADMIN_PASSWORD_HASH or a temporary ADMIN_PASSWORD with at least 8 characters.',
  );
}

function requireEnvironmentValue(value: string | undefined, message: string): string {
  const normalizedValue = value?.trim();

  if (normalizedValue === undefined || normalizedValue === '') {
    throw new Error(message);
  }

  return normalizedValue;
}

const database = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const projectStatusByStaticValue = {
  completed: ProjectStatus.COMPLETED,
  concept: ProjectStatus.CONCEPT,
  'in-progress': ProjectStatus.IN_PROGRESS,
} as const;
const defaultContentLocale = 'zh-CN';

async function seedAdministrator(): Promise<void> {
  const passwordHash =
    configuredPasswordHash === undefined || configuredPasswordHash === ''
      ? await hash(temporaryAdminPassword ?? '', 12)
      : configuredPasswordHash;

  await database.user.upsert({
    create: { email: adminEmail, passwordHash },
    update: { passwordHash },
    where: { email: adminEmail },
  });
}

async function seedProjects(): Promise<void> {
  await Promise.all(
    projects.map(async (project) => {
      await database.project.upsert({
        create: {
          categories: [...project.category],
          description: project.description,
          featured: project.featured,
          locale: defaultContentLocale,
          slug: project.slug,
          status: projectStatusByStaticValue[project.status],
          technologies: [...project.technologies],
          title: project.title,
        },
        update: {
          categories: [...project.category],
          description: project.description,
          featured: project.featured,
          status: projectStatusByStaticValue[project.status],
          technologies: [...project.technologies],
          title: project.title,
        },
        where: { locale_slug: { locale: defaultContentLocale, slug: project.slug } },
      });
    }),
  );
}

async function seedPosts(): Promise<void> {
  await Promise.all(
    blogPosts.map(async (post) => {
      const content = await readFile(join(process.cwd(), post.contentPath), 'utf8');

      await database.post.upsert({
        create: {
          category: post.category,
          content,
          description: post.description,
          locale: defaultContentLocale,
          published: !post.draft,
          publishedAt: post.draft ? null : new Date(`${post.publishedAt}T00:00:00.000Z`),
          slug: post.slug,
          tags: [...post.tags],
          title: post.title,
        },
        update: {
          category: post.category,
          content,
          description: post.description,
          published: !post.draft,
          publishedAt: post.draft ? null : new Date(`${post.publishedAt}T00:00:00.000Z`),
          tags: [...post.tags],
          title: post.title,
        },
        where: { locale_slug: { locale: defaultContentLocale, slug: post.slug } },
      });
    }),
  );
}

async function seedServices(): Promise<void> {
  await Promise.all(
    services.map(async (service) => {
      await database.service.upsert({
        create: {
          category: service.category,
          content: service.description,
          description: service.shortDescription,
          featured: service.featured,
          locale: defaultContentLocale,
          slug: service.slug,
          title: service.title,
        },
        update: {
          category: service.category,
          content: service.description,
          description: service.shortDescription,
          featured: service.featured,
          title: service.title,
        },
        where: { locale_slug: { locale: defaultContentLocale, slug: service.slug } },
      });
    }),
  );
}

async function seedKnowledge(): Promise<void> {
  const knowledgeDirectory = join(process.cwd(), 'src', 'ai', 'knowledge');
  const files = (await readdir(knowledgeDirectory)).filter((fileName) => fileName.endsWith('.md'));

  await Promise.all(
    files.map(async (fileName) => {
      const slug = fileName.replace(/\.md$/u, '');
      const content = await readFile(join(knowledgeDirectory, fileName), 'utf8');

      await database.knowledge.upsert({
        create: {
          category: slug,
          content,
          enabled: true,
          slug,
          syncStatus: KnowledgeSyncStatus.PENDING,
          title: `网站知识：${slug}`,
        },
        update: { content, enabled: true, syncStatus: KnowledgeSyncStatus.PENDING },
        where: { slug },
      });
    }),
  );
}

async function seedCrmAutomationRules(): Promise<void> {
  const rules = [
    {
      action: AutomationRuleAction.CREATE_FOLLOW_UP_TASK,
      delayHours: 24,
      name: 'new-lead-follow-up',
      trigger: AutomationRuleTrigger.LEAD_CREATED,
    },
    {
      action: AutomationRuleAction.SEND_CONTACT_CONFIRMATION,
      delayHours: 0,
      name: 'new-lead-contact-confirmation',
      trigger: AutomationRuleTrigger.LEAD_CREATED,
    },
    {
      action: AutomationRuleAction.SEND_ADMIN_NOTIFICATION,
      delayHours: 0,
      name: 'new-lead-admin-notification',
      trigger: AutomationRuleTrigger.LEAD_CREATED,
    },
  ] as const;

  await Promise.all(
    rules.map(async (rule) => {
      await database.automationRule.upsert({
        create: { ...rule, enabled: true },
        update: {},
        where: { name: rule.name },
      });
    }),
  );
}

async function main(): Promise<void> {
  await seedAdministrator();
  await Promise.all([
    seedProjects(),
    seedPosts(),
    seedServices(),
    seedKnowledge(),
    seedCrmAutomationRules(),
    ensureAiAutomationDefaults(database),
    ensureSaasDefaults(database),
  ]);
  console.info('CMS seed completed.');
}

try {
  await main();
} finally {
  await database.$disconnect();
}

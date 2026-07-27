import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getCmsDatabase } from '@/server/cms/database';
import type { AssistantLink } from '@/types/chat';
import type { Locale } from '@/types/i18n';

const knowledgeDirectory = join(process.cwd(), 'src', 'ai', 'knowledge');
const defaultKnowledgeIds = ['about', 'services', 'contact'] as const;
const maximumRetrievedDocuments = 3;

export type KnowledgeDocumentId = string;

export type KnowledgeDocument = Readonly<{
  readonly content: string;
  readonly fileName: string;
  readonly id: KnowledgeDocumentId;
  readonly keywords: readonly string[];
  readonly route: string;
  readonly routeLabel: string;
  readonly title: string;
}>;

type KnowledgeManifestItem = Omit<KnowledgeDocument, 'content'>;
const defaultKnowledgeIdSet = new Set<string>(defaultKnowledgeIds);

const knowledgeManifest = [
  {
    fileName: 'about.md',
    id: 'about',
    keywords: ['你是谁', '关于', '瞳瞳', '全栈', '开发者'],
    route: '/about',
    routeLabel: '了解瞳瞳',
    title: '关于瞳瞳',
  },
  {
    fileName: 'skills.md',
    id: 'skills',
    keywords: ['技术栈', '技术', 'java', 'python', 'vue', 'spring boot', 'fastapi', 'rag', 'agent'],
    route: '/#skills',
    routeLabel: '查看技术能力',
    title: '技术能力',
  },
  {
    fileName: 'projects.md',
    id: 'projects',
    keywords: ['项目', '案例', '商城', '管理系统', '知识库', 'rag', '问答', '自动发货'],
    route: '/projects',
    routeLabel: '查看项目案例',
    title: '项目方向',
  },
  {
    fileName: 'services.md',
    id: 'services',
    keywords: ['服务', '能做', '开发', '商城', '企业系统', 'ai', '知识库', 'rag', '自动化', '维护'],
    route: '/services',
    routeLabel: '了解服务内容',
    title: '服务内容',
  },
  {
    fileName: 'process.md',
    id: 'process',
    keywords: ['流程', 'mvp', '怎么做', '合作方式', '需求', '周期', '预算'],
    route: '/#process',
    routeLabel: '查看合作流程',
    title: '合作方式',
  },
  {
    fileName: 'blog.md',
    id: 'blog',
    keywords: ['博客', '文章', 'spring boot', 'vue', '架构', '技术文章'],
    route: '/blog',
    routeLabel: '阅读技术文章',
    title: '技术文章',
  },
  {
    fileName: 'faq.md',
    id: 'faq',
    keywords: ['如何开始', '已有项目', '完整系统', 'mvp', '问题'],
    route: '/contact',
    routeLabel: '查看合作问答',
    title: '常见问题',
  },
  {
    fileName: 'contact.md',
    id: 'contact',
    keywords: ['联系', '合作', '咨询', '开始项目', '提交需求'],
    route: '/contact',
    routeLabel: '开始沟通',
    title: '联系合作',
  },
] as const satisfies readonly KnowledgeManifestItem[];

function normalizeKnowledgeText(value: string): string {
  return value.toLocaleLowerCase('zh-CN').replaceAll(/[\s\p{P}\p{S}]/gu, '');
}

async function loadKnowledgeDocument(item: KnowledgeManifestItem): Promise<KnowledgeDocument> {
  const content = await readFile(join(knowledgeDirectory, item.fileName), 'utf8');

  return { ...item, content };
}

function getKnowledgeManifestItem(
  category: string,
  slug: string,
): KnowledgeManifestItem | undefined {
  return knowledgeManifest.find((item) => item.id === category || item.id === slug);
}

async function loadDatabaseKnowledge(): Promise<readonly KnowledgeDocument[] | undefined> {
  const database = getCmsDatabase();

  if (database === undefined) {
    return undefined;
  }

  try {
    const knowledgeEntries = await database.knowledge.findMany({
      orderBy: { updatedAt: 'desc' },
      where: { enabled: true },
    });

    if (knowledgeEntries.length === 0) {
      return undefined;
    }

    return knowledgeEntries.map((entry) => {
      const manifestItem = getKnowledgeManifestItem(entry.category, entry.slug);

      return {
        content: entry.content,
        fileName: 'database',
        id: entry.slug,
        keywords: [entry.title, entry.category],
        route: manifestItem?.route ?? '/contact',
        routeLabel: manifestItem?.routeLabel ?? '开始沟通',
        title: entry.title,
      };
    });
  } catch (error) {
    if (error instanceof Error) {
      return undefined;
    }

    throw error;
  }
}

export async function getSiteKnowledge(): Promise<readonly KnowledgeDocument[]> {
  const databaseKnowledge = await loadDatabaseKnowledge();

  return (
    databaseKnowledge ?? Promise.all(knowledgeManifest.map((item) => loadKnowledgeDocument(item)))
  );
}

function calculateDocumentScore(document: KnowledgeDocument, normalizedQuestion: string): number {
  const keywordScore = document.keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalizeKnowledgeText(keyword);

    return normalizedQuestion.includes(normalizedKeyword) ? score + 10 : score;
  }, 0);
  const contentScore = normalizeKnowledgeText(document.content).includes(normalizedQuestion)
    ? 1
    : 0;

  return keywordScore + contentScore;
}

export async function retrieveKnowledge(question: string): Promise<readonly KnowledgeDocument[]> {
  const documents = await getSiteKnowledge();
  const normalizedQuestion = normalizeKnowledgeText(question);
  const scoredDocuments = documents
    .map((document, index) => ({
      document,
      index,
      score: calculateDocumentScore(document, normalizedQuestion),
    }))
    .filter((entry) => entry.score > 0)
    .sort((first, second) => second.score - first.score || first.index - second.index)
    .slice(0, maximumRetrievedDocuments)
    .map((entry) => entry.document);

  if (scoredDocuments.length > 0) {
    return scoredDocuments;
  }

  return documents.filter((document) => defaultKnowledgeIdSet.has(document.id));
}

export function getKnowledgeLinks(
  documents: readonly KnowledgeDocument[],
  locale: Locale = 'zh-CN',
): readonly AssistantLink[] {
  const visitedRoutes = new Set<string>();

  return documents.flatMap((document) => {
    if (visitedRoutes.has(document.route)) {
      return [];
    }

    visitedRoutes.add(document.route);

    return [{ href: document.route, label: getKnowledgeRouteLabel(document, locale) }];
  });
}

function getKnowledgeRouteLabel(document: KnowledgeDocument, locale: Locale): string {
  if (locale !== 'en-US') {
    return document.routeLabel;
  }

  const englishLabels: Readonly<Record<string, string>> = {
    about: 'About Tong',
    blog: 'Read the journal',
    contact: 'Start a conversation',
    faq: 'Read collaboration FAQ',
    process: 'View the delivery process',
    projects: 'View project directions',
    services: 'View services',
    skills: 'View technical capabilities',
  };

  return englishLabels[document.id] ?? 'Start a conversation';
}

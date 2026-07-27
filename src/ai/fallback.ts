import { getKnowledgeLinks, type KnowledgeDocument } from '@/ai/knowledge/retrieval';
import type { AssistantLink } from '@/types/chat';
import type { Locale } from '@/types/i18n';

export type AssistantFallbackReply = Readonly<{
  readonly content: string;
  readonly links: readonly AssistantLink[];
}>;

function includesAny(question: string, values: readonly string[], locale: Locale): boolean {
  const normalizedQuestion = question.toLocaleLowerCase(locale);

  return values.some((value) => normalizedQuestion.includes(value));
}

function createChineseAnswer(question: string): string {
  if (includesAny(question, ['你是谁', '介绍', '关于', '瞳瞳'], 'zh-CN')) {
    return '瞳瞳是一名专注于 Java、Python、Vue 和 AI 应用开发的全栈开发者，关注从需求、产品方案和系统架构，到开发、AI 接入和部署上线的完整过程。\n\n下一步建议：可以继续了解技术方向，或直接描述你的项目想法。';
  }

  if (includesAny(question, ['ai', 'rag', '知识库', 'agent', '大模型'], 'zh-CN')) {
    return '可以围绕 AI 问答、企业知识库 RAG、文档检索、回答引用和人工校正来讨论。具体方案需要结合资料质量、使用流程与业务规则确认。\n\n下一步建议：先说明资料来源、主要使用者，以及希望减少的重复工作。';
  }

  if (includesAny(question, ['项目', '案例', '商城', '管理系统', '自动发货'], 'zh-CN')) {
    return '站内目前展示企业系统、AI 问答、企业知识库 RAG 与自动化交付等项目方向；它们均明确标记为个人项目或概念阶段，不代表虚构的客户成果。\n\n下一步建议：先查看接近你需求的项目方向，再通过联系页说明业务场景。';
  }

  if (
    includesAny(
      question,
      ['怎么合作', '如何开始', '合作方式', '流程', 'mvp', '预算', '周期'],
      'zh-CN',
    )
  ) {
    return '合作通常从需求沟通开始，再根据目标和范围整理产品方案、UI 与技术设计、开发测试以及部署维护。可以先从 MVP、独立模块或清晰的自动化流程开始。\n\n下一步建议：通过联系页说明目标、现状和希望达成的结果。';
  }

  if (includesAny(question, ['服务', '能做', '开发', '维护', '咨询', '合作'], 'zh-CN')) {
    return '可以从企业管理系统、AI 应用、Python 自动化、前后端功能开发、系统维护或技术咨询开始。也可以先梳理 MVP 或独立模块，不必一开始就做完整系统。\n\n下一步建议：告诉我你目前最想解决的业务问题。';
  }

  if (
    includesAny(question, ['技术', '技术栈', 'java', 'python', 'vue', 'spring', 'fastapi'], 'zh-CN')
  ) {
    return '当前技术方向覆盖 Java 与 Spring Boot、Python 与 FastAPI、Vue 3 与 TypeScript、MySQL、Redis、Docker，以及 RAG 和 AI 应用集成。技术选择会根据业务目标和已有系统确定。\n\n下一步建议：查看技术能力页，或直接说明你已有的技术环境。';
  }

  if (includesAny(question, ['博客', '文章', '架构', '学习'], 'zh-CN')) {
    return '站内文章持续记录企业管理系统、知识库 RAG 与可维护后台系统等技术和产品判断。文章可帮助理解方法，但具体项目仍需要结合你的场景评估。\n\n下一步建议：先阅读与你当前方向最接近的文章。';
  }

  return '我可以基于本站内容介绍瞳瞳的技术方向、项目案例、服务范围与合作方式。\n\n下一步建议：你可以直接问“能做 AI 系统吗？”或“如何开始合作？”。';
}

function createEnglishAnswer(question: string): string {
  if (includesAny(question, ['who are you', 'about', 'tong', 'developer'], 'en-US')) {
    return 'Tong is a full stack developer focused on Java, Python, Vue and AI applications, from discovery and product direction through system design, implementation and deployment.\n\nNext step: explore the technical focus or describe the product you want to build.';
  }

  if (includesAny(question, ['ai', 'rag', 'knowledge base', 'agent', 'llm'], 'en-US')) {
    return 'The site covers AI question answering, enterprise RAG knowledge systems, document retrieval, evidence-linked answers and human review. A suitable approach depends on source quality, user workflow and business rules.\n\nNext step: share the source material, intended users and the repetitive work you want to reduce.';
  }

  if (includesAny(question, ['project', 'case study', 'operations system', 'delivery'], 'en-US')) {
    return 'Current directions include enterprise operations software, AI question answering, enterprise RAG knowledge systems and automated digital delivery. They are presented honestly as independent projects or concepts, not invented client outcomes.\n\nNext step: open the closest project direction and describe the business context on the contact page.';
  }

  if (
    includesAny(
      question,
      ['work together', 'start', 'process', 'mvp', 'budget', 'timeline'],
      'en-US',
    )
  ) {
    return 'A collaboration usually starts with discovery, followed by product framing, interface and technical design, implementation, testing and deployment. A focused MVP, module or automation can be a sensible first delivery.\n\nNext step: use the contact page to share your goal, current situation and desired outcome.';
  }

  if (
    includesAny(question, ['service', 'build', 'maintain', 'consulting', 'collaborate'], 'en-US')
  ) {
    return 'The available directions include enterprise software, AI applications, Python automation, full-stack product delivery, system maintenance and technical consulting. You can begin with a focused capability instead of a complete system.\n\nNext step: describe the business problem you most want to solve.';
  }

  if (
    includesAny(
      question,
      ['technology', 'stack', 'java', 'python', 'vue', 'spring', 'fastapi'],
      'en-US',
    )
  ) {
    return 'The current technical focus includes Java and Spring Boot, Python and FastAPI, Vue 3 and TypeScript, MySQL, Redis, Docker, plus RAG and AI application integration. Technology choices follow the business goal and existing system.\n\nNext step: review the capability section or share the environment you already have.';
  }

  if (includesAny(question, ['blog', 'article', 'architecture', 'learn'], 'en-US')) {
    return 'The journal covers enterprise systems, RAG knowledge systems and maintainable admin software. It is designed to explain the reasoning behind product and engineering choices rather than promise a one-size-fits-all implementation.\n\nNext step: read the article closest to your current product or technical question.';
  }

  return 'I can introduce the technical focus, project directions, service scope and collaboration process presented on this site.\n\nNext step: ask something specific, such as “Can you build an AI knowledge system?” or “How would we start?”';
}

function getFallbackAnswer(question: string, locale: Locale): string {
  return locale === 'en-US' ? createEnglishAnswer(question) : createChineseAnswer(question);
}

export function createKnowledgeFallbackReply(
  question: string,
  documents: readonly KnowledgeDocument[],
  locale: Locale = 'zh-CN',
): AssistantFallbackReply {
  return {
    content: getFallbackAnswer(question, locale),
    links: getKnowledgeLinks(documents, locale),
  };
}

export function createRestrictedReply(locale: Locale = 'zh-CN'): AssistantFallbackReply {
  return locale === 'en-US'
    ? {
        content:
          'I can only help with the technical focus, projects, services, articles and collaboration information presented on this site.\n\nNext step: if you have a product idea, tell me the problem you want to solve.',
        links: [{ href: '/contact', label: 'Start a conversation' }],
      }
    : {
        content:
          '我只能协助了解本站的技术方向、项目、服务、文章与合作方式，不能提供内部配置或非站内信息。\n\n下一步建议：如果你有项目想法，可以告诉我希望解决的问题。',
        links: [{ href: '/contact', label: '开始沟通' }],
      };
}

export function createModelFailureReply(locale: Locale = 'zh-CN'): AssistantFallbackReply {
  return locale === 'en-US'
    ? {
        content:
          'I cannot answer right now. You can still discuss your project on the contact page.',
        links: [{ href: '/contact', label: 'Open contact page' }],
      }
    : {
        content: '暂时无法回答。你也可以直接通过联系页面沟通项目需求。',
        links: [{ href: '/contact', label: '前往联系页' }],
      };
}

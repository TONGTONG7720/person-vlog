import type { AssistantQuickAction } from '@/types/chat';
import type { Locale } from '@/types/i18n';

export type AssistantConfig = Readonly<{
  readonly inputLimit: number;
  readonly name: string;
  readonly quickActions: readonly AssistantQuickAction[];
  readonly storageKey: string;
  readonly welcomeMessage: string;
}>;

const assistantConfigByLocale = {
  'en-US': {
    inputLimit: 2_000,
    name: 'Tong Assistant',
    quickActions: [
      { label: 'What services are available?', prompt: 'What services can you provide?' },
      { label: 'Explore project directions', prompt: 'What project directions are available?' },
      { label: 'Understand AI capabilities', prompt: 'Can you build an AI system?' },
      { label: 'How would we start?', prompt: 'How would we start working together?' },
      { label: 'Review the technical focus', prompt: 'What is your technical stack?' },
    ],
    storageKey: 'tong-assistant-session-v1-en-US',
    welcomeMessage:
      'Hello, I am Tong Assistant.\n\nI can help you explore:\n• Technical focus\n• Project directions\n• Development services\n• Ways to collaborate\n\nWhat would you like to know?',
  },
  'zh-CN': {
    inputLimit: 2_000,
    name: 'Tong Assistant',
    quickActions: [
      { label: '我能提供哪些服务？', prompt: '我能提供哪些服务？' },
      { label: '查看项目案例', prompt: '有哪些项目案例？' },
      { label: '了解 AI 开发能力', prompt: '你能做 AI 系统吗？' },
      { label: '如何开始合作？', prompt: '如何开始合作？' },
      { label: '我的技术栈有哪些？', prompt: '你的技术栈有哪些？' },
    ],
    storageKey: 'tong-assistant-session-v1-zh-CN',
    welcomeMessage:
      '你好，我是 Tong Assistant。\n\n我可以帮助你了解：\n• 技术方向\n• 项目案例\n• 开发服务\n• 合作方式\n\n有什么想了解的吗？',
  },
} as const satisfies Readonly<Record<Locale, AssistantConfig>>;

export function getAssistantConfig(locale: Locale): AssistantConfig {
  return assistantConfigByLocale[locale];
}

export const assistantConfig = getAssistantConfig('zh-CN');

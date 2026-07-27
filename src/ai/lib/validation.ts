import { z } from 'zod';

import type { Locale } from '@/types/i18n';

const assistantMessageRoles = ['user', 'assistant'] as const;
const maximumAssistantMessages = 8;
const maximumAssistantQuestionLength = 2_000;

const suspectedInjectionPatterns = [
  /忽略.{0,24}(之前|以上|系统|指令|规则)/iu,
  /ignore.{0,24}(previous|system|instructions?|rules?)/iu,
  /(system prompt|系统提示词|内部提示词|开发者提示词)/iu,
  /(api key|密钥|环境变量|environment variables?)/iu,
  /(reveal|泄露|输出).{0,24}(prompt|提示词|密钥|key)/iu,
] as const;

export const assistantRequestSchema = z.object({
  locale: z.enum(['zh-CN', 'en-US']).default('zh-CN'),
  messages: z
    .array(
      z.object({
        content: z
          .string()
          .trim()
          .min(1, '请输入想了解的问题。')
          .max(maximumAssistantQuestionLength, '单次问题不能超过 2000 个字符。'),
        role: z.enum(assistantMessageRoles),
      }),
    )
    .min(1, '请至少提供一条消息。')
    .max(maximumAssistantMessages, '会话消息数量超出限制。'),
});

export type AssistantRequest = z.output<typeof assistantRequestSchema>;
export type AssistantRequestMessage = AssistantRequest['messages'][number];
export type AssistantRequestLocale = Locale;

export function isSafeAssistantQuestion(question: string): boolean {
  return !suspectedInjectionPatterns.some((pattern) => pattern.test(question));
}

export function getLatestUserQuestion(
  messages: readonly AssistantRequestMessage[],
): string | undefined {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message?.role === 'user') {
      return message.content;
    }
  }

  return undefined;
}

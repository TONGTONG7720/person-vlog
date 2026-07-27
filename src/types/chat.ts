import { z } from 'zod';

export const chatRoles = ['user', 'assistant'] as const;

export type ChatRole = (typeof chatRoles)[number];

export type AssistantLink = Readonly<{
  readonly href: string;
  readonly label: string;
}>;

export type ChatMessage = Readonly<{
  readonly content: string;
  readonly createdAt: number;
  readonly id: string;
  readonly links?: readonly AssistantLink[];
  readonly role: ChatRole;
}>;

export type AssistantQuickAction = Readonly<{
  readonly label: string;
  readonly prompt: string;
}>;

export const assistantLinkSchema = z.object({
  href: z.string().startsWith('/'),
  label: z.string().trim().min(1).max(80),
});

export const chatMessageSchema = z.object({
  content: z.string().max(4_000),
  createdAt: z.number().int().nonnegative(),
  id: z.string().min(1),
  links: z.array(assistantLinkSchema).max(3).optional(),
  role: z.enum(chatRoles),
});

export const chatSessionSchema = z.array(chatMessageSchema).max(12);

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { env } from '@/config/env';

const allowedExternalProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string): string {
  return new URL(path, env.siteUrl).toString();
}

export function isExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return allowedExternalProtocols.has(url.protocol);
  } catch (error) {
    if (error instanceof TypeError) {
      return false;
    }

    throw error;
  }
}

export function safeExternalUrl(value: string): string | undefined {
  try {
    const url = new URL(value);

    return allowedExternalProtocols.has(url.protocol) ? url.toString() : undefined;
  } catch (error) {
    if (error instanceof TypeError) {
      return undefined;
    }

    throw error;
  }
}

export function formatDate(value: string, locale = 'zh-CN'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

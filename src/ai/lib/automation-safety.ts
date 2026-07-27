import { isSafeAssistantQuestion } from '@/ai/lib/validation';

const maximumAutomationInputLength = 30_000;
const restrictedCommercialCommitmentPattern =
  /(?:¥|\$|报价|价格|预算(?:为|是)?|(?:\d+|[一二三四五六七八九十]+)\s*(?:天|周|个月)(?:内|后|即可|完成|交付|上线))/u;

export function isSafeAiAutomationInput(value: string): boolean {
  const normalizedValue = value.trim();

  return (
    normalizedValue.length > 0 &&
    normalizedValue.length <= maximumAutomationInputLength &&
    isSafeAssistantQuestion(normalizedValue)
  );
}

export function isSafeAiCommercialDraft(value: string): boolean {
  return !restrictedCommercialCommitmentPattern.test(value);
}

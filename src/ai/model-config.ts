const assistantProviders = ['openai', 'anthropic', 'gemini', 'local'] as const;

export type AssistantProvider = (typeof assistantProviders)[number];

export type AssistantModelConfiguration =
  | Readonly<{
      readonly apiKey: string;
      readonly endpoint: string;
      readonly kind: 'available';
      readonly model: string;
      readonly provider: AssistantProvider;
    }>
  | Readonly<{
      readonly kind: 'disabled';
    }>;

function isAssistantProvider(value: string): value is AssistantProvider {
  return assistantProviders.some((provider) => provider === value);
}

function getEnvironmentValue(name: string): string | undefined {
  const value = process.env[name]?.trim();

  return value === '' || value === undefined ? undefined : value;
}

function createOpenAiCompatibleEndpoint(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/u, '')}/chat/completions`;
}

export function getAssistantModelConfiguration(): AssistantModelConfiguration {
  const configuredProvider = getEnvironmentValue('AI_PROVIDER') ?? 'openai';
  const model = getEnvironmentValue('AI_MODEL');

  if (!isAssistantProvider(configuredProvider) || model === undefined) {
    return { kind: 'disabled' };
  }

  switch (configuredProvider) {
    case 'openai': {
      const apiKey = getEnvironmentValue('OPENAI_API_KEY');

      return apiKey === undefined
        ? { kind: 'disabled' }
        : {
            apiKey,
            endpoint: 'https://api.openai.com/v1/chat/completions',
            kind: 'available',
            model,
            provider: 'openai',
          };
    }
    case 'anthropic': {
      const apiKey = getEnvironmentValue('ANTHROPIC_API_KEY');

      return apiKey === undefined
        ? { kind: 'disabled' }
        : {
            apiKey,
            endpoint: 'https://api.anthropic.com/v1/messages',
            kind: 'available',
            model,
            provider: 'anthropic',
          };
    }
    case 'gemini': {
      const apiKey = getEnvironmentValue('GEMINI_API_KEY');

      return apiKey === undefined
        ? { kind: 'disabled' }
        : {
            apiKey,
            endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
            kind: 'available',
            model,
            provider: 'gemini',
          };
    }
    case 'local': {
      const baseUrl = getEnvironmentValue('AI_BASE_URL');

      return baseUrl === undefined
        ? { kind: 'disabled' }
        : {
            apiKey: getEnvironmentValue('AI_API_KEY') ?? '',
            endpoint: createOpenAiCompatibleEndpoint(baseUrl),
            kind: 'available',
            model,
            provider: 'local',
          };
    }
  }
}

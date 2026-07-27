export class AiPlatformInputError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'AiPlatformInputError';
  }
}

export class AiApiAuthenticationError extends Error {
  public constructor() {
    super('The AI API Key is not valid.');
    this.name = 'AiApiAuthenticationError';
  }
}

export class AiPlatformModelUnavailableError extends Error {
  public constructor() {
    super('No AI model is currently configured for this workspace.');
    this.name = 'AiPlatformModelUnavailableError';
  }
}

export class AiPlatformProcessingError extends Error {
  public constructor() {
    super('The document processing job could not be completed.');
    this.name = 'AiPlatformProcessingError';
  }
}

export class AiNativeAppStateError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'AiNativeAppStateError';
  }
}

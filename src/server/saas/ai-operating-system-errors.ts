export class AiOperatingSystemApprovalStateError extends Error {
  public override readonly name = 'AiOperatingSystemApprovalStateError';

  public constructor() {
    super('The AIOS approval request is no longer pending.');
  }
}

export class AiOperatingSystemInputError extends Error {
  public override readonly name = 'AiOperatingSystemInputError';

  public constructor(message: string) {
    super(message);
  }
}

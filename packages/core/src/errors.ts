export class StyleAiError extends Error {
  readonly code: string;
  readonly exposeToUser: boolean;

  constructor(code: string, message: string, options?: { exposeToUser?: boolean; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = 'StyleAiError';
    this.code = code;
    this.exposeToUser = options?.exposeToUser ?? true;
  }
}

export class NotConfiguredError extends StyleAiError {
  constructor(name: string) {
    super(
      'not_configured',
      `${name} is not configured. This operation cannot run with a fake fallback.`,
    );
    this.name = 'NotConfiguredError';
  }
}

export class ValidationError extends StyleAiError {
  constructor(message: string) {
    super('validation_error', message);
    this.name = 'ValidationError';
  }
}

export class QuotaExceededError extends StyleAiError {
  constructor(operation: string) {
    super(
      'quota_exceeded',
      `You've reached this month's limit for ${operation}. Upgrade to Pro for more.`,
    );
    this.name = 'QuotaExceededError';
  }
}

export class UnauthorizedError extends StyleAiError {
  constructor(message = 'You need to sign in to continue.') {
    super('unauthorized', message);
    this.name = 'UnauthorizedError';
  }
}

export function publicErrorMessage(error: unknown): string {
  if (error instanceof StyleAiError && error.exposeToUser) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

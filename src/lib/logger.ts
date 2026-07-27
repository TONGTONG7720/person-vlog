import * as Sentry from '@sentry/nextjs';

const sensitiveContextKeyPattern = /(api[-_]?key|authorization|cookie|password|secret|token)/iu;

export type LogLevel = 'info' | 'warn' | 'error';
export type LogContextValue = boolean | number | string | null | undefined;
export type LogContext = Readonly<Record<string, LogContextValue>>;

export type LogRecord = Readonly<{
  readonly context: Readonly<Record<string, Exclude<LogContextValue, undefined>>>;
  readonly event: string;
  readonly level: LogLevel;
  readonly timestamp: string;
}>;

type CreateLogRecordInput = Readonly<{
  readonly context?: LogContext;
  readonly event: string;
  readonly level: LogLevel;
  readonly timestamp: Date;
}>;

export function createLogRecord({
  context = {},
  event,
  level,
  timestamp,
}: CreateLogRecordInput): LogRecord {
  const safeContext: Record<string, Exclude<LogContextValue, undefined>> = {};

  for (const [key, value] of Object.entries(context)) {
    if (value === undefined) {
      continue;
    }

    safeContext[key] = sensitiveContextKeyPattern.test(key) ? '[REDACTED]' : value;
  }

  return {
    context: safeContext,
    event,
    level,
    timestamp: timestamp.toISOString(),
  };
}

function writeLog(level: LogLevel, event: string, context: LogContext = {}): void {
  if (process.env['NODE_ENV'] === 'test') {
    return;
  }

  const payload = JSON.stringify(
    createLogRecord({
      context,
      event,
      level,
      timestamp: new Date(),
    }),
  );

  switch (level) {
    case 'info':
      console.info(payload);
      return;
    case 'warn':
      console.warn(payload);
      return;
    case 'error':
      console.error(payload);
      return;
  }
}

function getErrorName(error: unknown): string {
  return error instanceof Error ? error.name : 'UnknownError';
}

export const logger = {
  error(event: string, error: unknown, context: LogContext = {}): void {
    const record = createLogRecord({
      context: { ...context, errorName: getErrorName(error) },
      event,
      level: 'error',
      timestamp: new Date(),
    });

    if (process.env['NODE_ENV'] === 'production') {
      Sentry.captureException(error, {
        extra: record.context,
        tags: { loggerEvent: event },
      });
    }

    writeLog('error', event, { ...context, errorName: getErrorName(error) });
  },
  info(event: string, context: LogContext = {}): void {
    writeLog('info', event, context);
  },
  warn(event: string, context: LogContext = {}): void {
    writeLog('warn', event, context);
  },
} as const;

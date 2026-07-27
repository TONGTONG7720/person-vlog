import { getAssistantModelConfiguration } from '@/ai/model-config';
import { logger } from '@/lib/logger';
import { getCmsDatabase, isCmsDatabaseConfigured } from '@/server/cms/database';

export const systemServiceStatuses = ['healthy', 'warning', 'error', 'not-configured'] as const;

export type SystemServiceStatus = (typeof systemServiceStatuses)[number];

export type SystemServiceHealth = Readonly<{
  readonly status: SystemServiceStatus;
}>;

export type SystemHealthServices = Readonly<{
  readonly ai: SystemServiceHealth;
  readonly database: SystemServiceHealth;
  readonly email: SystemServiceHealth;
  readonly monitoring: SystemServiceHealth;
  readonly website: SystemServiceHealth;
}>;

export type SystemHealthSnapshot = Readonly<{
  readonly checkedAt: string;
  readonly services: SystemHealthServices;
  readonly status: 'degraded' | 'ok';
}>;

type CreateSystemHealthSnapshotInput = Readonly<{
  readonly checkedAt: Date;
  readonly services: SystemHealthServices;
}>;

function isServiceError(service: SystemServiceHealth): boolean {
  return service.status === 'error';
}

export function createSystemHealthSnapshot({
  checkedAt,
  services,
}: CreateSystemHealthSnapshotInput): SystemHealthSnapshot {
  const hasSystemError = Object.values(services).some(isServiceError);

  return {
    checkedAt: checkedAt.toISOString(),
    services,
    status: hasSystemError ? 'degraded' : 'ok',
  };
}

function isEnvironmentValueConfigured(name: string): boolean {
  return (process.env[name]?.trim().length ?? 0) > 0;
}

function getAiServiceHealth(): SystemServiceHealth {
  return getAssistantModelConfiguration().kind === 'available'
    ? { status: 'healthy' }
    : { status: 'not-configured' };
}

function getEmailServiceHealth(): SystemServiceHealth {
  return isEnvironmentValueConfigured('RESEND_API_KEY') &&
    isEnvironmentValueConfigured('CONTACT_EMAIL')
    ? { status: 'healthy' }
    : { status: 'not-configured' };
}

function getMonitoringServiceHealth(): SystemServiceHealth {
  return isEnvironmentValueConfigured('SENTRY_DSN') ||
    isEnvironmentValueConfigured('NEXT_PUBLIC_SENTRY_DSN')
    ? { status: 'healthy' }
    : { status: 'not-configured' };
}

async function getDatabaseServiceHealth(): Promise<SystemServiceHealth> {
  if (!isCmsDatabaseConfigured()) {
    return { status: 'not-configured' };
  }

  const database = getCmsDatabase();

  if (database === undefined) {
    return { status: 'error' };
  }

  try {
    await database.$queryRaw`SELECT 1`;

    return { status: 'healthy' };
  } catch (error) {
    logger.error('health.database_check_failed', error, { service: 'database' });

    return { status: 'error' };
  }
}

export async function getSystemHealth(): Promise<SystemHealthSnapshot> {
  const database = await getDatabaseServiceHealth();

  return createSystemHealthSnapshot({
    checkedAt: new Date(),
    services: {
      ai: getAiServiceHealth(),
      database,
      email: getEmailServiceHealth(),
      monitoring: getMonitoringServiceHealth(),
      website: { status: 'healthy' },
    },
  });
}

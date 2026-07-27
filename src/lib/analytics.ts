import { captureFirstUtmAttribution, readContactSource, rememberContactSource } from '@/lib/utm';
import { getLocaleFromPathname } from '@/i18n/config';
import type {
  AnalyticsAttribution,
  AnalyticsEventMetadata,
  AnalyticsEventName,
  AssistantAnalyticsCategory,
  ContactAnalyticsSource,
  ContentConversionTarget,
  ProjectAnalyticsAction,
} from '@/types/analytics';

type NavigatorWithStandaloneFlag = Navigator &
  Readonly<{
    readonly standalone?: boolean;
  }>;

const analyticsEndpoint = '/api/analytics';
const analyticsSessionStorageKey = 'tong.analytics.session-id';

type AnalyticsTransportPayload = Readonly<{
  readonly event: AnalyticsEventName;
  readonly metadata: AnalyticsEventMetadata[AnalyticsEventName];
  readonly path: string;
  readonly sessionId: string;
}>;

export function isAnalyticsEnabled(): boolean {
  return (
    typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'production' &&
    window.navigator.doNotTrack !== '1'
  );
}

export function trackEvent<EventName extends AnalyticsEventName>(
  event: EventName,
  metadata: AnalyticsEventMetadata[EventName],
  path = getCurrentPath(),
): void {
  if (!isAnalyticsEnabled()) {
    return;
  }

  const payload: AnalyticsTransportPayload = {
    event,
    metadata: withAttribution(metadata, path),
    path,
    sessionId: getAnalyticsSessionId(),
  };

  sendAnalyticsPayload(payload);
}

export function trackPageView(path: string): void {
  captureFirstUtmAttribution();
  trackEvent('page_view', {}, path);
}

export function trackProjectView(project: string, path: string): void {
  trackEvent('view_project', { project }, path);
}

export function trackArticleRead(slug: string, path: string): void {
  trackEvent('read_article', { slug }, path);
}

export function trackServiceView(service: string): void {
  trackEvent('view_service', { service });
}

export function trackContactClick(source: ContactAnalyticsSource): void {
  rememberContactSource(source);
  trackEvent('click_contact', { source });
}

export function trackContactSubmission(service: string): void {
  const source = readContactSource();

  trackEvent('submit_contact', {
    service,
    ...(source === undefined ? {} : { source }),
  });
}

export function trackAssistantUsage(category: AssistantAnalyticsCategory): void {
  trackEvent('use_ai_assistant', { category });
}

export function trackArticleEngagement(
  slug: string,
  durationSeconds: number,
  completed: boolean,
): void {
  trackEvent('article_engagement', {
    completed,
    durationSeconds: Math.max(0, Math.min(3_600, Math.round(durationSeconds))),
    slug,
  });
}

export function trackProjectAction(project: string, action: ProjectAnalyticsAction): void {
  trackEvent('project_action', { action, project });
}

export function trackContentConversion(
  slug: string,
  target: ContentConversionTarget,
  targetId?: string,
): void {
  trackEvent('content_conversion', {
    slug,
    target,
    ...(targetId === undefined ? {} : { targetId }),
  });
}

export function categorizeAssistantQuestion(question: string): AssistantAnalyticsCategory {
  const normalizedQuestion = question.toLocaleLowerCase('zh-CN');

  if (/(项目|案例|作品|rag|知识库|系统)/u.test(normalizedQuestion)) {
    return 'project';
  }

  if (/(服务|报价|预算|开发什么|能做什么)/u.test(normalizedQuestion)) {
    return 'service';
  }

  if (/(合作|联系|周期|流程|上线)/u.test(normalizedQuestion)) {
    return 'cooperation';
  }

  if (/(java|python|vue|ai|技术|spring|fastapi|架构)/u.test(normalizedQuestion)) {
    return 'technology';
  }

  return 'general';
}

function getCurrentPath(): string {
  if (typeof window === 'undefined') {
    return '/';
  }

  const pathname = window.location.pathname;

  return pathname.startsWith('/') && !pathname.startsWith('//') ? pathname : '/';
}

function getAnalyticsSessionId(): string {
  try {
    const storedSessionId = window.sessionStorage.getItem(analyticsSessionStorageKey);

    if (storedSessionId !== null && isUuid(storedSessionId)) {
      return storedSessionId;
    }

    const sessionId = createSessionId();
    window.sessionStorage.setItem(analyticsSessionStorageKey, sessionId);

    return sessionId;
  } catch {
    return createSessionId();
  }
}

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return '00000000-0000-4000-8000-000000000000';
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(value);
}

function withAttribution<EventName extends AnalyticsEventName>(
  metadata: AnalyticsEventMetadata[EventName],
  path: string,
): AnalyticsAttribution & AnalyticsEventMetadata[EventName] {
  return {
    ...captureFirstUtmAttribution(),
    ...metadata,
    accessMode: getPwaAccessMode(),
    language: getLocaleFromPathname(path),
  };
}

function hasStandaloneFlag(navigator: Navigator): navigator is NavigatorWithStandaloneFlag {
  return 'standalone' in navigator;
}

function getPwaAccessMode(): 'browser' | 'pwa' {
  if (typeof window === 'undefined') {
    return 'browser';
  }

  const standaloneDisplayMode =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;
  const standaloneNavigator =
    hasStandaloneFlag(window.navigator) && window.navigator.standalone === true;

  return standaloneDisplayMode || standaloneNavigator ? 'pwa' : 'browser';
}

function sendAnalyticsPayload(payload: AnalyticsTransportPayload): void {
  const body = JSON.stringify(payload);

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const wasQueued = navigator.sendBeacon(
      analyticsEndpoint,
      new Blob([body], { type: 'application/json' }),
    );

    if (wasQueued) {
      return;
    }
  }

  void fetch(analyticsEndpoint, {
    body,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    method: 'POST',
  }).catch(() => undefined);
}

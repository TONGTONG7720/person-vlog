import Link from 'next/link';

const aiCenterNavigationItems = [
  { href: '/admin/ai', label: 'AI 概览' },
  { href: '/admin/ai/logs', label: '调用日志' },
  { href: '/admin/ai/prompts', label: 'Prompt' },
  { href: '/admin/ai/settings', label: '模型与通知' },
  { href: '/admin/knowledge', label: '知识审核' },
] as const;

type AiCenterNavigationProps = Readonly<{
  readonly current: (typeof aiCenterNavigationItems)[number]['href'];
}>;

export function AiCenterNavigation({ current }: AiCenterNavigationProps): React.JSX.Element {
  return (
    <nav aria-label="AI 工作台导航" className="ai-center-navigation">
      {aiCenterNavigationItems.map((item) => (
        <Link
          aria-current={item.href === current ? 'page' : undefined}
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

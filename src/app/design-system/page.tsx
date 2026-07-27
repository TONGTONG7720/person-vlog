import Link from 'next/link';

import { MotionPreferenceStatus } from '@/components/animation/motion-preference-status';
import { Reveal } from '@/components/animation/reveal';
import { Stagger, StaggerItem } from '@/components/animation/stagger';
import { TextReveal } from '@/components/animation/text-reveal';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/typography/section-heading';
import { createMetadata } from '@/lib/metadata';

const foundationChecks = [
  ['Header', '滚动状态、当前路由与桌面/移动导航'],
  ['Footer', 'CTA、统一导航与返回顶部'],
  ['Motion', 'Reveal、Stagger、TextReveal 与 Reduced Motion'],
] as const;

export const metadata = createMetadata({
  noIndex: true,
  path: '/design-system',
  title: '设计系统检查页',
});

export default function DesignSystemPage(): React.JSX.Element {
  return (
    <div>
      <Section
        ariaLabelledBy="design-system-title"
        className="pt-[calc(var(--navigation-height)+var(--section-space-lg))]"
        container="content"
        spacing="lg"
      >
        <SectionHeading
          description="用于阶段四的基础组件、响应式行为和动效偏好检查，不承载正式业务内容。"
          eyebrow="FOUNDATION CHECK"
          id="design-system-title"
          number="00"
          size="lg"
          title="设计系统基础层"
        />
        <Stagger className="mt-12 grid gap-4 md:grid-cols-3">
          {foundationChecks.map(([name, description]) => (
            <StaggerItem key={name}>
              <article className="border-border-subtle bg-raised min-h-44 rounded-[var(--radius-card)] border p-5">
                <p className="text-cyan type-caption font-mono tracking-[0.08em]">{name}</p>
                <p className="type-body-md text-muted mt-4">{description}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section
        ariaLabelledBy="motion-check-title"
        background="secondary"
        container="content"
        spacing="lg"
      >
        <SectionHeading eyebrow="MOTION" id="motion-check-title" title="可访问的基础动效" />
        <div className="mt-8 max-w-[var(--container-text-max)] space-y-5">
          <Reveal variant="blur">
            <p className="type-body-lg text-muted">
              Reveal 只使用透明度、短位移与轻模糊，不会承载关键信息。
            </p>
          </Reveal>
          <p className="type-body-lg text-ink">
            <TextReveal>TextReveal 保留一份可访问文本，并按行或语义块进行揭示。</TextReveal>
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button disabled variant="secondary">
              Button 状态已配置
            </Button>
            <MotionPreferenceStatus />
          </div>
        </div>
      </Section>

      <Section ariaLabelledBy="navigation-check-title" container="content" spacing="md">
        <SectionHeading
          action={
            <Link className={buttonVariants({ variant: 'secondary' })} href="/">
              返回结构首页
            </Link>
          }
          eyebrow="NAVIGATION"
          id="navigation-check-title"
          title="键盘与焦点检查"
        />
        <p className="type-body-md text-muted mt-6 max-w-[var(--container-text-max)]">
          使用 Tab 检查 Skip Link、导航、CTA、移动菜单和 Footer
          返回顶部；系统减少动态效果时，内容应直接可见。
        </p>
      </Section>
    </div>
  );
}

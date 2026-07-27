import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/typography/section-heading';

export type RoutePlaceholderProps = Readonly<{
  description: string;
  eyebrow: string;
  title: string;
}>;

export function RoutePlaceholder({
  description,
  eyebrow,
  title,
}: RoutePlaceholderProps): React.JSX.Element {
  const headingId = `${eyebrow.toLowerCase().replaceAll(' ', '-')}-placeholder-title`;

  return (
    <Section
      ariaLabelledBy={headingId}
      className="pt-[calc(var(--navigation-height)+var(--section-space-md))]"
      container="content"
      spacing="lg"
    >
      <SectionHeading
        description={description}
        eyebrow={`阶段四 / ${eyebrow}`}
        id={headingId}
        size="lg"
        title={title}
      />
      <div className="border-border-subtle mt-12 border-t pt-5">
        <p className="type-body-sm text-subtle">
          本页仅用于验证路由、导航状态与全站布局，正式内容将在对应阶段开发。
        </p>
      </div>
    </Section>
  );
}

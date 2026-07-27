import type { ReactNode } from 'react';

import { Reveal } from '@/components/animation/reveal';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Eyebrow } from '@/components/typography/eyebrow';
import { cn } from '@/lib/utils';

type SectionHeadingTag = 'h2' | 'h3';

export type SectionHeadingProps = Readonly<{
  action?: ReactNode;
  align?: 'center' | 'left';
  animated?: boolean;
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  headingAs?: SectionHeadingTag;
  id?: string;
  number?: string;
  size?: 'lg' | 'md';
  title: ReactNode;
}>;

export function SectionHeading({
  action,
  align = 'left',
  animated = false,
  className,
  description,
  eyebrow,
  headingAs = 'h2',
  id,
  number,
  size = 'md',
  title,
}: SectionHeadingProps): React.JSX.Element {
  const isCentered = align === 'center';
  const content = (
    <div
      className={cn(
        isCentered ? 'items-center text-center' : 'items-start',
        'flex flex-col',
        className,
      )}
    >
      {eyebrow || number ? <Eyebrow {...(number ? { number } : {})}>{eyebrow}</Eyebrow> : null}
      <Heading
        as={headingAs}
        className={cn('max-w-[var(--container-text-max)]', eyebrow || number ? 'mt-4' : undefined)}
        id={id}
        size={size === 'lg' ? 'display-md' : 'h2'}
      >
        {title}
      </Heading>
      {description ? (
        <Paragraph className="mt-4 max-w-[var(--container-text-max)]" size="lg">
          {description}
        </Paragraph>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );

  return animated ? <Reveal>{content}</Reveal> : content;
}

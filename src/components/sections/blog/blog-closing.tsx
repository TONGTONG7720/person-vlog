import { ArrowRight } from 'lucide-react';

import { Reveal } from '@/components/animation/reveal';
import { Link } from '@/i18n/navigation';
import type { BlogSectionContent } from '@/types/blog';

export type BlogClosingProps = Readonly<{
  content: BlogSectionContent['closing'];
}>;

export function BlogClosing({ content }: BlogClosingProps): React.JSX.Element {
  return (
    <Reveal className="blog-closing" distance={18} duration={0.64} variant="fade-up">
      <p>{content.statement}</p>
      <Link className="blog-closing-link" href="/blog">
        <span>{content.actionLabel}</span>
        <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} />
      </Link>
    </Reveal>
  );
}

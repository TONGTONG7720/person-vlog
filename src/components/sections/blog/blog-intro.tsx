import { Reveal } from '@/components/animation/reveal';
import type { BlogSectionContent } from '@/types/blog';

export type BlogIntroProps = Readonly<{
  content: BlogSectionContent['intro'];
}>;

export function BlogIntro({ content }: BlogIntroProps): React.JSX.Element {
  return (
    <div className="blog-intro">
      <Reveal className="blog-intro-title" distance={18} duration={0.6} variant="fade-up">
        <p>{content.title}</p>
      </Reveal>
      <Reveal
        className="blog-intro-description"
        delay={0.08}
        distance={18}
        duration={0.6}
        variant="fade-up"
      >
        <p>{content.description}</p>
      </Reveal>
    </div>
  );
}

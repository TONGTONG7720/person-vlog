import { ArrowUpRight } from 'lucide-react';

import { SectionHeading } from '@/components/typography/section-heading';
import { Container } from '@/components/ui/container';
import { getProjectsSectionCopy } from '@/data/projects';
import { getRequestLocale } from '@/i18n/server';
import { Link } from '@/i18n/navigation';
import { getPublicFeaturedProjects } from '@/server/cms/public-content';

import { FeaturedProjects } from '@/components/sections/projects/featured-projects';
import { ProjectsHashAnchor } from '@/components/sections/projects/projects-hash-anchor';

export async function ProjectsSection(): Promise<React.JSX.Element> {
  const locale = await getRequestLocale();
  const [featuredProjects, copy] = await Promise.all([
    getPublicFeaturedProjects(locale),
    getProjectsSectionCopy(locale),
  ]);

  return (
    <section aria-labelledby="projects-heading" className="projects-section" id="projects">
      <ProjectsHashAnchor />
      <Container size="content">
        <SectionHeading
          action={
            <Link className="projects-home-directory-link" href="/projects">
              <span>{copy.labels.viewAll}</span>
              <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} />
            </Link>
          }
          animated
          description={copy.content.description}
          eyebrow={copy.content.eyebrow}
          id="projects-heading"
          number="04"
          size="lg"
          title={copy.content.title}
        />
        <FeaturedProjects labels={copy.labels} locale={locale} projects={featuredProjects} />
      </Container>
    </section>
  );
}

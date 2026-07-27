import { notFound } from 'next/navigation';

import { ProjectAnalyticsActions } from '@/components/analytics/project-analytics-actions';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { JsonLd } from '@/components/seo/json-ld';
import { getProjectLabels } from '@/config/project';
import { projects } from '@/data/projects';
import { getPublicPageCopy } from '@/i18n/page-copy';
import { getRequestLocale } from '@/i18n/server';
import { createMetadata } from '@/lib/metadata';
import { generateProjectSchema } from '@/lib/schema';
import { getPublicProjectBySlug } from '@/server/cms/public-content';

type ProjectDetailPageProps = Readonly<{
  params: Promise<{
    slug: string;
  }>;
}>;

export const dynamic = 'force-dynamic';

export function generateStaticParams(): { slug: string }[] {
  return projects.map((project) => ({ slug: project.slug }));
}

export const revalidate = 3_600;

export async function generateMetadata({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const [project, copy] = await Promise.all([
    getPublicProjectBySlug(slug, locale),
    getPublicPageCopy(locale),
  ]);

  return createMetadata({
    ...(project ? { description: project.description } : {}),
    ...(project ? {} : { noIndex: true }),
    locale,
    path: `/projects/${slug}`,
    title: project?.title ?? copy.projectDetail.notFound,
  });
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const [project, copy] = await Promise.all([
    getPublicProjectBySlug(slug, locale),
    getPublicPageCopy(locale),
  ]);

  if (!project) {
    notFound();
  }

  const labels = getProjectLabels(locale);

  return (
    <>
      <JsonLd data={generateProjectSchema(project, locale)} />
      <section aria-labelledby="project-detail-title" className="project-detail-placeholder">
        <Container size="content">
          <p className="project-detail-placeholder-meta">
            {labels.category[project.category[0]]} · {project.year} ·{' '}
            {labels.type[project.projectType]} · {labels.status[project.status]}
          </p>
          <Heading as="h1" id="project-detail-title" size="display-md">
            {project.title}
          </Heading>
          <p className="project-detail-placeholder-description">{project.description}</p>
          <p className="project-detail-placeholder-note">{copy.projectDetail.note}</p>
          <ProjectAnalyticsActions project={project} />
        </Container>
      </section>
    </>
  );
}

import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { getProjectLabels } from '@/config/project';
import { Link } from '@/i18n/navigation';
import { getPublicPageCopy } from '@/i18n/page-copy';
import { getRequestLocale } from '@/i18n/server';
import { createMetadata } from '@/lib/metadata';
import { getPublicProjects } from '@/server/cms/public-content';

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const copy = getPublicPageCopy(locale);

  return createMetadata({
    description: copy.projects.description,
    locale,
    path: '/projects',
    title: copy.projects.title,
  });
}

export const dynamic = 'force-dynamic';

export default async function ProjectsPage(): Promise<React.JSX.Element> {
  const locale = await getRequestLocale();
  const [projects, copy] = await Promise.all([
    getPublicProjects(locale),
    getPublicPageCopy(locale),
  ]);
  const labels = getProjectLabels(locale);

  return (
    <section aria-labelledby="projects-page-title" className="projects-directory">
      <Container size="content">
        <p className="projects-directory-eyebrow">{copy.projects.eyebrow}</p>
        <Heading as="h1" id="projects-page-title" size="display-md">
          {copy.projects.title}
        </Heading>
        <p className="projects-directory-intro">{copy.projects.description}</p>
        <ul className="projects-directory-list">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link className="projects-directory-link" href={`/projects/${project.slug}`}>
                <span className="projects-directory-meta">
                  {labels.category[project.category[0]]} · {project.year} ·{' '}
                  {labels.type[project.projectType]} · {labels.status[project.status]}
                </span>
                <span className="projects-directory-title">{project.title}</span>
                <span className="projects-directory-description">{project.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

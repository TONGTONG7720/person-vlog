import { ContentConversionLink } from '@/components/content/content-conversion-link';
import { Link } from '@/i18n/navigation';
import { getRelatedBlogPosts } from '@/lib/blog';
import type { BlogPost } from '@/types/blog';
import type { Locale } from '@/types/i18n';
import type { Project } from '@/types/project';
import type { Service } from '@/types/service';

type RelatedContentProps = Readonly<{
  readonly locale: Locale;
  readonly post: BlogPost;
  readonly posts: readonly BlogPost[];
  readonly projects: readonly Project[];
  readonly services: readonly Service[];
}>;

export function RelatedContent({
  locale,
  post,
  posts,
  projects,
  services,
}: RelatedContentProps): React.JSX.Element | null {
  const relatedPosts = getRelatedBlogPosts({ currentPost: post, posts });
  const relatedProjects = projects.filter((project) => post.relatedProjects.includes(project.slug));
  const relatedServices = services.filter((service) => post.relatedServices.includes(service.slug));

  if (relatedPosts.length === 0 && relatedProjects.length === 0 && relatedServices.length === 0) {
    return null;
  }

  const copy =
    locale === 'en-US'
      ? {
          contact: 'Facing a similar challenge? Let’s talk about your project.',
          heading: 'Keep exploring the problem.',
          posts: 'Related articles',
          projects: 'Related projects',
          services: 'Related services',
        }
      : {
          contact: '有类似的问题？和我聊聊你的项目。',
          heading: '继续沿着这个问题往下看。',
          posts: '相关文章',
          projects: '关联项目',
          services: '相关服务',
        };

  return (
    <aside aria-label={copy.heading} className="article-related-content">
      <p className="article-related-eyebrow">KEEP EXPLORING</p>
      <h2>{copy.heading}</h2>
      <div className="article-related-grid">
        {relatedPosts.map((item) => (
          <Link href={`/blog/${item.slug}`} key={item.slug}>
            <span>{copy.posts}</span>
            <strong>{item.title}</strong>
            <small>{item.description}</small>
          </Link>
        ))}
        {relatedProjects.map((project) => (
          <ContentConversionLink
            href={`/projects/${project.slug}`}
            key={project.slug}
            slug={post.slug}
            target="project"
            targetId={project.slug}
          >
            <span>{copy.projects}</span>
            <strong>{project.title}</strong>
            <small>{project.description}</small>
          </ContentConversionLink>
        ))}
        {relatedServices.map((service) => (
          <ContentConversionLink
            href="/services"
            key={service.slug}
            slug={post.slug}
            target="service"
            targetId={service.slug}
          >
            <span>{copy.services}</span>
            <strong>{service.title}</strong>
            <small>{service.shortDescription}</small>
          </ContentConversionLink>
        ))}
      </div>
      <ContentConversionLink
        className="article-contact-link"
        href="/contact"
        slug={post.slug}
        target="contact"
      >
        {copy.contact}
      </ContentConversionLink>
    </aside>
  );
}

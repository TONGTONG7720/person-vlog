import type { MarkdownHeading } from '@/lib/markdown';
import type { Locale } from '@/types/i18n';

type ArticleTableOfContentsProps = Readonly<{
  readonly headings: readonly MarkdownHeading[];
  readonly locale: Locale;
}>;

export function ArticleTableOfContents({
  headings,
  locale,
}: ArticleTableOfContentsProps): React.JSX.Element | null {
  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={locale === 'en-US' ? 'Article table of contents' : '文章目录'}
      className="article-table-of-contents"
    >
      <p>{locale === 'en-US' ? 'On this page' : '本篇目录'}</p>
      <ol>
        {headings.map((heading) => (
          <li data-depth={heading.depth} key={`${heading.id}-${heading.title}`}>
            <a href={`#${heading.id}`}>{heading.title}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

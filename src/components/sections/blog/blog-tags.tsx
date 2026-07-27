export type BlogTagsProps = Readonly<{
  ariaLabel: string;
  tags: readonly string[];
}>;

export function BlogTags({ ariaLabel, tags }: BlogTagsProps): React.JSX.Element {
  return (
    <ul aria-label={ariaLabel} className="blog-tags">
      {tags.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
}

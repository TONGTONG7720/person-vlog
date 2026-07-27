export type MarkdownHeading = Readonly<{
  readonly depth: 2 | 3;
  readonly id: string;
  readonly title: string;
}>;

const markdownHeadingPattern = /^(#{2,3})\s+(.+)$/gmu;

export function getMarkdownHeadings(content: string): readonly MarkdownHeading[] {
  return Array.from(content.matchAll(markdownHeadingPattern)).flatMap((match) => {
    const marker = match[1];
    const rawTitle = match[2]?.trim();

    if (rawTitle === undefined || marker === undefined) {
      return [];
    }

    const depth = marker.length;

    if (depth !== 2 && depth !== 3) {
      return [];
    }

    return [{ depth, id: createMarkdownHeadingId(rawTitle), title: rawTitle }];
  });
}

export function createMarkdownHeadingId(value: string): string {
  const normalized = value
    .replaceAll(/[`*_~]/gu, '')
    .trim()
    .toLocaleLowerCase('zh-CN')
    .replaceAll(/[^\p{L}\p{N}]+/gu, '-');

  return normalized === '' ? 'section' : normalized.replaceAll(/^-+|-+$/gu, '');
}

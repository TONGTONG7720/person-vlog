import { serializeJsonLd, type JsonLd } from '@/lib/schema';

export type JsonLdProps = Readonly<{
  readonly data: JsonLd;
}>;

export function JsonLd({ data }: JsonLdProps): React.JSX.Element {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      type="application/ld+json"
    />
  );
}

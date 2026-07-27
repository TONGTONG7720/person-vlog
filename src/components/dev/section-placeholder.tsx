import { SectionHeading } from '@/components/typography/section-heading';

export type SectionPlaceholderProps = Readonly<{
  id: string;
  number: string;
  status: string;
  title: string;
}>;

export function SectionPlaceholder({
  id,
  number,
  status,
  title,
}: SectionPlaceholderProps): React.JSX.Element {
  return (
    <div className="border-border-subtle flex min-h-56 flex-col justify-end border-y py-8 sm:min-h-64 sm:py-12">
      <SectionHeading animated eyebrow="阶段四 / 结构骨架" id={id} number={number} title={title} />
      <p className="type-body-md text-muted mt-5 max-w-[var(--container-text-max)]">{status}</p>
    </div>
  );
}

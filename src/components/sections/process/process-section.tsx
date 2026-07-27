import { CompactProcessPipeline } from '@/components/sections/process/compact-process-pipeline';
import { ProcessHashAnchor } from '@/components/sections/process/process-hash-anchor';
import { SectionHeading } from '@/components/typography/section-heading';
import { Container } from '@/components/ui/container';
import { getProcessSectionContent, getProcessSteps, getProcessUiCopy } from '@/data/process';
import { getHomePreviewCopy } from '@/data/home-preview';
import { getRequestLocale } from '@/i18n/server';

export async function ProcessSection(): Promise<React.JSX.Element> {
  const locale = await getRequestLocale();
  const content = getProcessSectionContent(locale);
  const steps = getProcessSteps(locale);
  const ui = getProcessUiCopy(locale);
  const homeCopy = getHomePreviewCopy(locale).process;

  return (
    <section aria-labelledby="process-heading" className="process-section" id="process">
      <ProcessHashAnchor />
      <Container size="content">
        <div className="process-heading">
          <SectionHeading
            animated
            description={content.description}
            eyebrow={content.eyebrow}
            id="process-heading"
            number={content.number}
            size="lg"
            title={content.title}
          />
        </div>
        <CompactProcessPipeline
          detailLabel={homeCopy.detailLabel}
          pipelineLabel={homeCopy.pipelineLabel}
          steps={steps}
          ui={ui}
        />
      </Container>
    </section>
  );
}

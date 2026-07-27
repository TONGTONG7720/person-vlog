import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

export default function Loading(): React.JSX.Element {
  return (
    <Section className="loading-page-section">
      <Container size="content">
        <div aria-live="polite" className="loading-page-shell" role="status">
          <p className="loading-page-label">正在准备页面内容</p>
          <div aria-hidden="true" className="loading-page-lines">
            <span className="loading-page-line loading-page-line--title" />
            <span className="loading-page-line loading-page-line--copy" />
            <span className="loading-page-line loading-page-line--copy loading-page-line--short" />
          </div>
          <VisuallyHidden>正在加载页面内容</VisuallyHidden>
        </div>
      </Container>
    </Section>
  );
}

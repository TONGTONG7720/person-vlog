import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Paragraph } from '@/components/ui/paragraph';
import { Link } from '@/i18n/navigation';

export default function OfflinePage(): React.JSX.Element {
  return (
    <section aria-labelledby="offline-heading" className="offline-page">
      <Container className="offline-page-inner" size="narrow">
        <div className="offline-page-card">
          <p className="offline-page-eyebrow">TONG / OFFLINE</p>
          <Heading as="h1" id="offline-heading" size="display-md">
            当前网络不可用。
          </Heading>
          <Paragraph className="offline-page-description" size="lg">
            部分内容将在恢复连接后重新加载。
          </Paragraph>
          <Link className="offline-page-link" href="/">
            返回首页
          </Link>
        </div>
      </Container>
    </section>
  );
}

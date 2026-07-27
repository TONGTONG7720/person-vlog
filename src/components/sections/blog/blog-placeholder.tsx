import type { BlogCoverVariant } from '@/types/blog';

export type BlogPlaceholderProps = Readonly<{
  variant: BlogCoverVariant;
}>;

function EnterpriseSystemCover(): React.JSX.Element {
  return (
    <>
      <div className="blog-cover-grid" />
      <div className="blog-cover-window blog-cover-window--primary">
        <span className="blog-cover-window-label">OPERATIONS API</span>
        <span className="blog-cover-window-line" />
        <span className="blog-cover-window-line blog-cover-window-line--short" />
        <div className="blog-cover-window-bars">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="blog-cover-node blog-cover-node--one" />
      <div className="blog-cover-node blog-cover-node--two" />
      <div className="blog-cover-path blog-cover-path--one" />
      <div className="blog-cover-code">/v1/roles</div>
    </>
  );
}

function RagSystemCover(): React.JSX.Element {
  return (
    <>
      <div className="blog-cover-orbit blog-cover-orbit--large" />
      <div className="blog-cover-orbit blog-cover-orbit--small" />
      <div className="blog-cover-document blog-cover-document--one">
        <span />
        <span />
        <span />
      </div>
      <div className="blog-cover-document blog-cover-document--two">
        <span />
        <span />
      </div>
      <div className="blog-cover-query">RETRIEVE</div>
      <div className="blog-cover-node blog-cover-node--three" />
      <div className="blog-cover-node blog-cover-node--four" />
      <div className="blog-cover-path blog-cover-path--two" />
    </>
  );
}

function ArchitectureSystemCover(): React.JSX.Element {
  return (
    <>
      <div className="blog-cover-grid" />
      <div className="blog-cover-module blog-cover-module--one">
        <span>AUTH</span>
      </div>
      <div className="blog-cover-module blog-cover-module--two">
        <span>DOMAIN</span>
      </div>
      <div className="blog-cover-module blog-cover-module--three">
        <span>DATA</span>
      </div>
      <div className="blog-cover-flow blog-cover-flow--one" />
      <div className="blog-cover-flow blog-cover-flow--two" />
      <div className="blog-cover-flow blog-cover-flow--three" />
      <div className="blog-cover-axis">
        <span>BOUNDARIES</span>
      </div>
    </>
  );
}

export function BlogPlaceholder({ variant }: BlogPlaceholderProps): React.JSX.Element {
  return (
    <div aria-hidden="true" className={`blog-cover blog-cover--${variant}`}>
      {variant === 'enterprise-system' ? <EnterpriseSystemCover /> : null}
      {variant === 'rag-system' ? <RagSystemCover /> : null}
      {variant === 'architecture-system' ? <ArchitectureSystemCover /> : null}
    </div>
  );
}

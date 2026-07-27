import { heroRuntimeModules } from '@/data/hero-code-constellation';

export function HeroCodeConstellation(): React.JSX.Element {
  return (
    <div aria-hidden="true" className="hero-code-constellation">
      <div className="hero-code-field">
        <svg
          className="hero-code-field-svg"
          focusable="false"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 760 560"
        >
          <path className="hero-code-field-line" d="M90 426 264 312 424 366 648 186" />
          <path className="hero-code-field-line" d="M134 154 264 312 370 126 648 186" />
          <path
            className="hero-code-field-line hero-code-field-line--subtle"
            d="M90 426 244 478 424 366"
          />
          <path
            className="hero-code-field-line hero-code-field-line--subtle"
            d="M370 126 520 84 648 186"
          />
          <circle className="hero-code-field-node" cx="90" cy="426" r="5" />
          <circle className="hero-code-field-node" cx="134" cy="154" r="4" />
          <circle className="hero-code-field-node" cx="264" cy="312" r="7" />
          <circle
            className="hero-code-field-node hero-code-field-node--accent"
            cx="370"
            cy="126"
            r="5"
          />
          <circle className="hero-code-field-node" cx="424" cy="366" r="6" />
          <circle
            className="hero-code-field-node hero-code-field-node--accent"
            cx="648"
            cy="186"
            r="6"
          />
        </svg>
      </div>
      <span className="hero-code-pulse hero-code-pulse--one" />
      <span className="hero-code-pulse hero-code-pulse--two" />
      <div className="hero-runtime-rail">
        {heroRuntimeModules.map((module) => (
          <span className="hero-runtime-module" data-status={module.status} key={module.label}>
            <i />
            {module.label}
          </span>
        ))}
      </div>
    </div>
  );
}

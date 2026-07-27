export function SceneFallback(): React.JSX.Element {
  return (
    <div aria-hidden="true" className="hero-static-network">
      <svg focusable="false" viewBox="0 0 600 520">
        <g fill="none">
          <path className="hero-static-network-line" d="M106 156 244 116 350 218 496 148" />
          <path className="hero-static-network-line" d="M86 326 244 264 366 344 514 300" />
          <path className="hero-static-network-line" d="M244 116 244 264M350 218 366 344" />
          <path className="hero-static-network-line" d="M244 264 350 218M366 344 496 148" />
          <rect
            className="hero-static-network-core"
            height="92"
            rx="9"
            width="92"
            x="254"
            y="202"
          />
          <rect
            className="hero-static-network-core"
            height="52"
            rx="7"
            width="52"
            x="190"
            y="230"
          />
          <rect
            className="hero-static-network-core"
            height="42"
            rx="6"
            width="42"
            x="364"
            y="242"
          />
        </g>
        <circle className="hero-static-network-node" cx="106" cy="156" r="4" />
        <circle className="hero-static-network-node" cx="244" cy="116" r="5" />
        <circle className="hero-static-network-node--accent" cx="350" cy="218" r="4" />
        <circle className="hero-static-network-node" cx="496" cy="148" r="3.5" />
        <circle className="hero-static-network-node" cx="86" cy="326" r="4" />
        <circle className="hero-static-network-node--accent" cx="244" cy="264" r="4" />
        <circle className="hero-static-network-node" cx="366" cy="344" r="5" />
        <circle className="hero-static-network-node" cx="514" cy="300" r="3.5" />
      </svg>
    </div>
  );
}

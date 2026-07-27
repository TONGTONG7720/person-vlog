'use client';

export function SkipLink(): React.JSX.Element {
  const handleSkipLinkClick = (): void => {
    window.requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus();
    });
  };

  return (
    <a
      className="bg-brand text-ink fixed start-4 top-4 z-[var(--z-skip-link)] -translate-y-24 rounded-sm px-4 py-3 text-sm font-medium transition-transform focus:translate-y-0"
      href="#main-content"
      onClick={handleSkipLinkClick}
    >
      跳到主要内容
    </a>
  );
}

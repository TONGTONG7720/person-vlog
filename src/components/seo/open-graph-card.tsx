import type { Locale } from '@/types/i18n';

type OpenGraphCardProps = Readonly<{
  locale: Locale;
}>;

export function OpenGraphCard({ locale }: OpenGraphCardProps): React.JSX.Element {
  const isEnglish = locale === 'en-US';

  return (
    <div
      style={{
        alignItems: 'flex-start',
        background:
          'radial-gradient(circle at 78% 22%, rgba(34, 211, 238, 0.22), transparent 28%), radial-gradient(circle at 24% 84%, rgba(99, 102, 241, 0.24), transparent 36%), #050505',
        color: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        padding: '76px',
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          color: '#a1a1aa',
          display: 'flex',
          fontSize: 24,
          letterSpacing: '0.16em',
        }}
      >
        TONG.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div
          style={{
            display: 'flex',
            fontSize: isEnglish ? 72 : 68,
            fontWeight: 700,
            letterSpacing: '-0.05em',
          }}
        >
          {isEnglish ? 'Full Stack Developer' : '全栈开发者'}
        </div>
        <div style={{ color: '#c4b5fd', display: 'flex', fontSize: 32, letterSpacing: '0.04em' }}>
          Java · Python · Vue · AI
        </div>
      </div>
      <div
        style={{
          alignItems: 'center',
          color: '#a1a1aa',
          display: 'flex',
          fontSize: 22,
          gap: '14px',
        }}
      >
        <div
          style={{ background: '#22d3ee', borderRadius: '999px', height: '10px', width: '10px' }}
        />
        {isEnglish ? 'SOFTWARE · SYSTEMS · AI APPLICATIONS' : '软件产品 · 企业系统 · AI 应用'}
      </div>
    </div>
  );
}

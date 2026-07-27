export type HeroRuntimeLabel = 'JAVA' | 'PYTHON' | 'VUE' | 'AI';
export type HeroRuntimeStatus = 'active' | 'ready';
export type HeroCodeTone = 'keyword' | 'type' | 'function' | 'string' | 'plain';

export type HeroRuntimeModule = Readonly<{
  label: HeroRuntimeLabel;
  status: HeroRuntimeStatus;
}>;

export type HeroCodeToken = Readonly<{
  tone: HeroCodeTone;
  value: string;
}>;

export type HeroCodeLine = Readonly<{
  tokens: readonly HeroCodeToken[];
}>;

export type HeroCodePanel = Readonly<{
  language: Extract<HeroRuntimeLabel, 'JAVA' | 'PYTHON' | 'VUE'>;
  lines: readonly HeroCodeLine[];
}>;

export const heroRuntimeModules = [
  { label: 'JAVA', status: 'active' },
  { label: 'PYTHON', status: 'active' },
  { label: 'VUE', status: 'ready' },
  { label: 'AI', status: 'active' },
] as const satisfies readonly HeroRuntimeModule[];

export const heroCodePanels: readonly HeroCodePanel[] = [
  {
    language: 'JAVA',
    lines: [
      {
        tokens: [
          { tone: 'keyword', value: 'public ' },
          { tone: 'type', value: 'record ' },
          { tone: 'function', value: 'Product' },
        ],
      },
      {
        tokens: [
          { tone: 'plain', value: '  ' },
          { tone: 'type', value: 'String' },
          { tone: 'plain', value: ' name' },
        ],
      },
      { tokens: [{ tone: 'plain', value: ') {}' }] },
    ],
  },
  {
    language: 'PYTHON',
    lines: [
      {
        tokens: [
          { tone: 'keyword', value: 'async def ' },
          { tone: 'function', value: 'build' },
          { tone: 'plain', value: '(idea):' },
        ],
      },
      {
        tokens: [
          { tone: 'plain', value: '  return ' },
          { tone: 'string', value: '"shipped"' },
        ],
      },
      {
        tokens: [
          { tone: 'plain', value: '  ' },
          { tone: 'type', value: '# AI ready' },
        ],
      },
    ],
  },
  {
    language: 'VUE',
    lines: [
      {
        tokens: [
          { tone: 'keyword', value: 'const ' },
          { tone: 'function', value: 'product' },
          { tone: 'plain', value: ' = ' },
          { tone: 'function', value: 'ref' },
          { tone: 'plain', value: '()' },
        ],
      },
      {
        tokens: [
          { tone: 'plain', value: '<' },
          { tone: 'type', value: 'Experience' },
          { tone: 'plain', value: ' />' },
        ],
      },
      {
        tokens: [
          { tone: 'plain', value: '// ' },
          { tone: 'string', value: 'make it useful' },
        ],
      },
    ],
  },
];

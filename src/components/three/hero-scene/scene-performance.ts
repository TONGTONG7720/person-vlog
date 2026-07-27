export const heroSceneQuality = {
  full: 'full',
  lite: 'lite',
} as const;

export type HeroSceneQuality = (typeof heroSceneQuality)[keyof typeof heroSceneQuality];

type HeroScenePerformance = Readonly<{
  dpr: readonly [number, number];
  nodeCount: number;
}>;

export const heroScenePerformance = {
  full: {
    dpr: [1, 1.5],
    nodeCount: 36,
  },
  lite: {
    dpr: [1, 1.25],
    nodeCount: 20,
  },
} as const satisfies Readonly<Record<HeroSceneQuality, HeroScenePerformance>>;

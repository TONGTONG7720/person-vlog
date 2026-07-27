'use client';

import { Canvas } from '@react-three/fiber';

import { HeroScene } from '@/components/three/hero-scene/hero-scene';
import {
  heroScenePerformance,
  type HeroSceneQuality,
} from '@/components/three/hero-scene/scene-performance';
import { usePageVisibility } from '@/hooks/use-page-visibility';

export type HeroCanvasProps = Readonly<{
  onReady: () => void;
  quality: HeroSceneQuality;
}>;

export function HeroCanvas({ onReady, quality }: HeroCanvasProps): React.JSX.Element {
  const isPageVisible = usePageVisibility();
  const qualityProfile = heroScenePerformance[quality];
  const dpr: [number, number] = [qualityProfile.dpr[0], qualityProfile.dpr[1]];

  return (
    <Canvas
      camera={{ far: 100, fov: 34, near: 0.1, position: [0, 0.1, 9] }}
      className="hero-scene-canvas"
      dpr={dpr}
      frameloop={isPageVisible ? 'always' : 'never'}
      gl={{ alpha: true, antialias: quality === 'full', powerPreference: 'high-performance' }}
      onCreated={onReady}
    >
      <HeroScene isPageVisible={isPageVisible} quality={quality} />
    </Canvas>
  );
}

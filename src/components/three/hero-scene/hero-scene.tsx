import { AbstractNetwork } from '@/components/three/hero-scene/abstract-network';
import { SceneCamera } from '@/components/three/hero-scene/scene-camera';
import { SceneLights } from '@/components/three/hero-scene/scene-lights';
import type { HeroSceneQuality } from '@/components/three/hero-scene/scene-performance';

export type HeroSceneProps = Readonly<{
  isPageVisible: boolean;
  quality: HeroSceneQuality;
}>;

export function HeroScene({ isPageVisible, quality }: HeroSceneProps): React.JSX.Element {
  return (
    <>
      <SceneLights />
      <SceneCamera isPageVisible={isPageVisible} />
      <AbstractNetwork isPageVisible={isPageVisible} quality={quality} />
    </>
  );
}

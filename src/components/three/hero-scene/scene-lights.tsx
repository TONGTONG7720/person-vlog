import { heroSceneTheme } from '@/components/three/hero-scene/scene-theme';

export function SceneLights(): React.JSX.Element {
  return (
    <>
      <ambientLight color={heroSceneTheme.ambient} intensity={1.15} />
      <pointLight color={heroSceneTheme.directional} intensity={24} position={[2.6, 2.8, 3.8]} />
      <pointLight color={heroSceneTheme.accent} intensity={12} position={[-3.4, -1.8, 2.4]} />
    </>
  );
}

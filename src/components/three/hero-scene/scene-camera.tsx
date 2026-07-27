import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';

export type SceneCameraProps = Readonly<{
  isPageVisible: boolean;
}>;

export function SceneCamera({ isPageVisible }: SceneCameraProps): null {
  useFrame((state, delta) => {
    if (!isPageVisible) {
      return;
    }

    const { camera, pointer } = state;
    camera.position.x = MathUtils.damp(camera.position.x, pointer.x * 0.2, 3.5, delta);
    camera.position.y = MathUtils.damp(camera.position.y, pointer.y * 0.12 + 0.1, 3.5, delta);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

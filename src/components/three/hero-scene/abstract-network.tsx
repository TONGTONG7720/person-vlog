import { useFrame } from '@react-three/fiber';
import { MathUtils, type Group } from 'three';
import { useRef } from 'react';

import type { HeroSceneQuality } from '@/components/three/hero-scene/scene-performance';
import { heroSceneTheme } from '@/components/three/hero-scene/scene-theme';

type NodeDefinition = readonly [x: number, y: number, z: number, scale: number];
type ModuleDefinition = readonly [x: number, y: number, z: number, scale: number];

const nodeDefinitions = [
  [-3.4, 1.72, -0.8, 0.052],
  [-3.06, 0.72, 0.38, 0.045],
  [-2.82, -1.36, -0.6, 0.058],
  [-2.46, 2.42, -1.14, 0.04],
  [-2.16, -0.12, 1.12, 0.06],
  [-1.88, 1.2, -0.18, 0.048],
  [-1.5, -2.14, -0.2, 0.05],
  [-1.24, 2.08, 0.68, 0.042],
  [-0.94, -0.74, -1.52, 0.055],
  [-0.62, 1.64, 1.18, 0.045],
  [-0.32, -1.74, 0.82, 0.04],
  [-0.16, 0.38, -1.72, 0.065],
  [0.12, 2.54, -0.42, 0.05],
  [0.42, -0.16, 1.56, 0.046],
  [0.72, -2.32, -0.9, 0.06],
  [0.94, 1.16, -1.34, 0.044],
  [1.34, 2.16, 0.72, 0.054],
  [1.52, -1.02, 1.08, 0.046],
  [1.84, 0.34, -1.82, 0.06],
  [2.04, -2.18, 0.2, 0.05],
  [2.36, 1.74, -0.38, 0.044],
  [2.58, -0.36, 1.4, 0.052],
  [2.86, 2.58, 0.32, 0.038],
  [3.04, -1.48, -1.22, 0.056],
  [3.32, 0.88, -1.02, 0.045],
  [3.58, -2.46, 0.42, 0.043],
  [3.82, 1.84, 0.92, 0.052],
  [4.06, -0.72, -0.44, 0.047],
  [4.28, 2.72, -0.8, 0.04],
  [4.48, 0.2, 1.24, 0.05],
  [4.72, -2.02, -0.42, 0.042],
  [4.94, 1.28, -1.6, 0.057],
  [5.18, -1.12, 0.94, 0.045],
  [5.42, 2.28, 0.08, 0.05],
  [5.68, -0.24, -1.16, 0.044],
  [5.94, -2.56, 0.18, 0.052],
] as const satisfies readonly NodeDefinition[];

const moduleDefinitions = [
  [-0.88, 0.54, 0.34, 0.74],
  [-0.36, -0.62, -0.28, 0.54],
  [0.12, 0.08, -0.64, 0.68],
  [0.64, 0.92, -0.1, 0.46],
  [0.94, -0.48, 0.54, 0.58],
  [0.18, 1.3, 0.46, 0.4],
  [-0.92, -0.96, 0.22, 0.38],
  [1.16, 0.3, -0.48, 0.42],
] as const satisfies readonly ModuleDefinition[];

const connectionPositions = new Float32Array([
  -3.4, 1.72, -0.8, -1.88, 1.2, -0.18, -1.88, 1.2, -0.18, -0.16, 0.38, -1.72, -2.16, -0.12, 1.12,
  -0.32, -1.74, 0.82, -0.32, -1.74, 0.82, 1.52, -1.02, 1.08, -1.24, 2.08, 0.68, 0.12, 2.54, -0.42,
  0.12, 2.54, -0.42, 1.34, 2.16, 0.72, 0.94, 1.16, -1.34, 1.84, 0.34, -1.82, 1.84, 0.34, -1.82,
  3.32, 0.88, -1.02, 2.58, -0.36, 1.4, 4.48, 0.2, 1.24, 4.48, 0.2, 1.24, 5.18, -1.12, 0.94, 3.82,
  1.84, 0.92, 5.42, 2.28, 0.08, 2.04, -2.18, 0.2, 3.58, -2.46, 0.42,
]);

export type AbstractNetworkProps = Readonly<{
  isPageVisible: boolean;
  quality: HeroSceneQuality;
}>;

export function AbstractNetwork({
  isPageVisible,
  quality,
}: AbstractNetworkProps): React.JSX.Element {
  const networkRef = useRef<Group>(null);
  const coreRef = useRef<Group>(null);
  const nodes = quality === 'full' ? nodeDefinitions : nodeDefinitions.slice(0, 20);

  useFrame((state, delta) => {
    if (!isPageVisible) {
      return;
    }

    const network = networkRef.current;
    const core = coreRef.current;

    if (network !== null) {
      const elapsedTime = state.clock.getElapsedTime();
      network.rotation.x = MathUtils.damp(
        network.rotation.x,
        pointerRotation(state.pointer.y) + Math.sin(elapsedTime * 0.14) * 0.012,
        3.6,
        delta,
      );
      network.rotation.y = MathUtils.damp(
        network.rotation.y,
        pointerRotation(state.pointer.x) + elapsedTime * 0.055,
        3.6,
        delta,
      );
      network.position.y = Math.sin(elapsedTime * 0.38) * 0.1;
    }

    if (core !== null) {
      core.rotation.x += delta * 0.026;
      core.rotation.y += delta * 0.052;
      core.position.y = Math.sin(state.clock.getElapsedTime() * 0.62) * 0.07;
    }
  });

  return (
    <group position={[-1.1, 0, 0]} ref={networkRef}>
      {quality === 'full' ? (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[connectionPositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color={heroSceneTheme.line}
            depthWrite={false}
            opacity={0.25}
            transparent
          />
        </lineSegments>
      ) : null}

      <group ref={coreRef}>
        {moduleDefinitions.map(([x, y, z, scale], index) => (
          <mesh
            key={`${x}-${y}-${z}`}
            position={[x, y, z]}
            rotation={[index * 0.18, index * 0.24, index * 0.1]}
            scale={scale}
          >
            <boxGeometry args={[1.15, 1.15, 1.15]} />
            <meshStandardMaterial
              color={heroSceneTheme.core}
              emissive={heroSceneTheme.coreEdge}
              emissiveIntensity={0.14}
              metalness={0.32}
              opacity={0.76}
              roughness={0.5}
              transparent
            />
          </mesh>
        ))}
      </group>

      <group>
        {nodes.map(([x, y, z, scale], index) => (
          <mesh key={`${x}-${y}-${z}`} position={[x, y, z]} scale={scale}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshBasicMaterial
              color={index % 7 === 0 ? heroSceneTheme.accent : heroSceneTheme.node}
              opacity={index % 5 === 0 ? 0.94 : 0.64}
              transparent
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function pointerRotation(value: number): number {
  return value * 0.08;
}

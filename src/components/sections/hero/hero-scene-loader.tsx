'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SceneErrorBoundary } from '@/components/three/hero-scene/scene-error-boundary';
import type { HeroSceneQuality } from '@/components/three/hero-scene/scene-performance';
import { useMotionPreference } from '@/components/providers/motion-provider';
import { useMediaQuery } from '@/hooks/use-media-query';
import { canUseWebGL } from '@/lib/webgl';

const HeroCanvas = dynamic(
  () => import('@/components/three/hero-scene/hero-canvas').then((module) => module.HeroCanvas),
  {
    loading: () => null,
    ssr: false,
  },
);

const sceneSupportQuery = '(min-width: 48rem) and (pointer: fine)';
const fullSceneQuery = '(min-width: 64rem) and (pointer: fine)';
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function resolveSceneQuality(supportsFullScene: boolean): HeroSceneQuality {
  const hasLimitedCpu = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4;

  return supportsFullScene && !hasLimitedCpu ? 'full' : 'lite';
}

function useHeroSceneScrollResponse(
  sceneRef: React.RefObject<HTMLDivElement | null>,
  isSceneEnabled: boolean,
): void {
  useEffect(() => {
    if (!isSceneEnabled) {
      return;
    }

    const scene = sceneRef.current;

    if (scene === null) {
      return;
    }

    let animationFrame: number | undefined;

    const commitScrollResponse = (): void => {
      animationFrame = undefined;
      const viewportHeight = Math.max(window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / viewportHeight, 0), 1);
      const scale = 1 - progress * 0.04;
      const opacity = 1 - progress * 0.25;

      scene.style.setProperty('--hero-scene-scroll-scale', scale.toFixed(3));
      scene.style.setProperty('--hero-scene-scroll-opacity', opacity.toFixed(3));
    };

    const scheduleScrollResponse = (): void => {
      if (animationFrame === undefined) {
        animationFrame = window.requestAnimationFrame(commitScrollResponse);
      }
    };

    scheduleScrollResponse();
    document.addEventListener('scroll', scheduleScrollResponse, { passive: true });

    return () => {
      document.removeEventListener('scroll', scheduleScrollResponse);

      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }

      scene.style.removeProperty('--hero-scene-scroll-scale');
      scene.style.removeProperty('--hero-scene-scroll-opacity');
    };
  }, [isSceneEnabled, sceneRef]);
}

export function HeroSceneLoader(): React.JSX.Element {
  const sceneRef = useRef<HTMLDivElement>(null);
  const supportsScene = useMediaQuery(sceneSupportQuery);
  const supportsFullScene = useMediaQuery(fullSceneQuery);
  const prefersReducedMotion = useMotionPreference();
  const [isSceneEnabled, setIsSceneEnabled] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [hasSceneError, setHasSceneError] = useState(false);
  const [sceneQuality, setSceneQuality] = useState<HeroSceneQuality>('lite');

  useEffect(() => {
    const initializationFrame = window.requestAnimationFrame(() => {
      const browserPrefersReducedMotion = window.matchMedia(reducedMotionQuery).matches;

      if (prefersReducedMotion || browserPrefersReducedMotion || !supportsScene) {
        setIsSceneEnabled(false);
        setIsSceneReady(false);
        return;
      }

      setHasSceneError(false);
      setIsSceneReady(false);
      setSceneQuality(resolveSceneQuality(supportsFullScene));
      setIsSceneEnabled(canUseWebGL());
    });

    return () => {
      window.cancelAnimationFrame(initializationFrame);
    };
  }, [prefersReducedMotion, supportsFullScene, supportsScene]);

  const handleSceneError = useCallback((): void => {
    setHasSceneError(true);
    setIsSceneReady(false);
  }, []);

  const handleSceneReady = useCallback((): void => {
    setIsSceneReady(true);
  }, []);

  const canRenderScene = isSceneEnabled && !hasSceneError;
  useHeroSceneScrollResponse(sceneRef, canRenderScene);

  return (
    <div
      aria-hidden="true"
      className="hero-scene-loader"
      data-ready={canRenderScene && isSceneReady}
      ref={sceneRef}
    >
      {canRenderScene ? (
        <SceneErrorBoundary onError={handleSceneError}>
          <HeroCanvas onReady={handleSceneReady} quality={sceneQuality} />
        </SceneErrorBoundary>
      ) : null}
    </div>
  );
}

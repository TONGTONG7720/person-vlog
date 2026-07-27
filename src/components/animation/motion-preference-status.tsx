'use client';

import { useMotionPreference } from '@/components/providers/motion-provider';

export function MotionPreferenceStatus(): React.JSX.Element {
  const prefersReducedMotion = useMotionPreference();

  return (
    <p aria-live="polite" className="type-body-sm text-subtle">
      {prefersReducedMotion
        ? '已遵循系统的减少动态效果偏好。'
        : '动态效果将在支持的设备上保持克制。'}
    </p>
  );
}

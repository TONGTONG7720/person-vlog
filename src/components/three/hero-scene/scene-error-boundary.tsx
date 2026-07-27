'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

type SceneErrorBoundaryProps = Readonly<{
  children: ReactNode;
  onError: () => void;
}>;

type SceneErrorBoundaryState = Readonly<{
  hasError: boolean;
}>;

export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  public override state: SceneErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(_error: Error): SceneErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    this.props.onError();
  }

  public override render(): ReactNode {
    return this.state.hasError ? null : this.props.children;
  }
}

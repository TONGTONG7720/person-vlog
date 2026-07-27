export function canUseWebGL(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');

    return context !== null;
  } catch (error) {
    if (error instanceof Error) {
      return false;
    }

    return false;
  }
}

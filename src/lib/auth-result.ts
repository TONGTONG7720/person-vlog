import type { SignInResponse } from 'next-auth/react';

export function isSignInFailure(result: SignInResponse | undefined): boolean {
  return result?.ok !== true || result.error !== null;
}

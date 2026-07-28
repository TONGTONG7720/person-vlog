import type { SignInResponse } from 'next-auth/react';
import { describe, expect, it } from 'vitest';

import { isSignInFailure } from '../src/lib/auth-result';

const successfulSignIn: SignInResponse = {
  error: null,
  ok: true,
  status: 200,
  url: '/admin/dashboard',
};

describe('登录结果判定', () => {
  it('将 error 为 null 的成功认证结果视为成功', () => {
    expect(isSignInFailure(successfulSignIn)).toBe(false);
  });

  it('将认证错误视为失败', () => {
    expect(
      isSignInFailure({
        ...successfulSignIn,
        error: 'CredentialsSignin',
        ok: false,
        url: null,
      }),
    ).toBe(true);
  });

  it('将没有返回结果的登录请求视为失败', () => {
    expect(isSignInFailure(undefined)).toBe(true);
  });
});

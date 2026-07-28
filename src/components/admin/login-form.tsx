'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { isSignInFailure } from '@/lib/auth-result';

export function AdminLoginForm(): React.JSX.Element {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData): Promise<void> {
    setErrorMessage(undefined);
    setIsSubmitting(true);

    const result = await signIn('admin-credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });

    setIsSubmitting(false);

    if (isSignInFailure(result)) {
      setErrorMessage('邮箱、密码或后台配置不正确。');

      return;
    }

    router.replace('/admin/dashboard');
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="admin-login-form">
      <label>
        <span>管理员邮箱</span>
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label>
        <span>密码</span>
        <input
          autoComplete="current-password"
          name="password"
          minLength={8}
          required
          type="password"
        />
      </label>
      {errorMessage === undefined ? null : (
        <p aria-live="polite" className="admin-form-feedback" role="alert">
          {errorMessage}
        </p>
      )}
      <button className="admin-primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? '正在验证…' : '进入后台'}
      </button>
    </form>
  );
}

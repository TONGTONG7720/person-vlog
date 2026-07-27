'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function ClientLoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const registrationCompleted = searchParameters.get('registered') === '1';

  async function handleSubmit(formData: FormData): Promise<void> {
    setErrorMessage(undefined);
    setIsSubmitting(true);

    const result = await signIn('client-credentials', {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error !== undefined) {
      setErrorMessage('邮箱或密码不正确，或当前账号尚未加入企业空间。');
      return;
    }

    router.replace('/client');
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="saas-entry-form">
      {registrationCompleted ? (
        <p className="saas-form-feedback saas-feedback-success" role="status">
          企业空间已创建，请使用刚刚设置的账户登录。
        </p>
      ) : null}
      <label>
        <span>工作邮箱</span>
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label>
        <span>密码</span>
        <input
          autoComplete="current-password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
      {errorMessage === undefined ? null : (
        <p aria-live="polite" className="saas-form-feedback" role="alert">
          {errorMessage}
        </p>
      )}
      <button className="saas-primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? '正在登录…' : '进入项目空间'}
      </button>
      <p className="saas-entry-note">
        还没有企业空间？<Link href="/signup">创建一个协作空间</Link>
      </p>
    </form>
  );
}

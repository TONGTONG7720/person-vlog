'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

const registrationResponseSchema = z.object({ message: z.string().optional() });

export function SignupForm(): React.JSX.Element {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData): Promise<void> {
    setErrorMessage(undefined);
    setIsSubmitting(true);

    const response = await fetch('/api/v1/auth/register', {
      body: JSON.stringify({
        email: String(formData.get('email') ?? ''),
        organizationName: String(formData.get('organizationName') ?? ''),
        password: String(formData.get('password') ?? ''),
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const parsedPayload = registrationResponseSchema.safeParse(await response.json());

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(
        parsedPayload.success
          ? (parsedPayload.data.message ?? '暂时无法创建企业空间。')
          : '暂时无法创建企业空间。',
      );
      return;
    }

    router.replace('/client/login?registered=1');
  }

  return (
    <form action={handleSubmit} className="saas-entry-form">
      <label>
        <span>企业或团队名称</span>
        <input
          autoComplete="organization"
          name="organizationName"
          minLength={2}
          required
          type="text"
        />
      </label>
      <label>
        <span>工作邮箱</span>
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label>
        <span>设置密码</span>
        <input autoComplete="new-password" minLength={8} name="password" required type="password" />
      </label>
      {errorMessage === undefined ? null : (
        <p aria-live="polite" className="saas-form-feedback" role="alert">
          {errorMessage}
        </p>
      )}
      <button className="saas-primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? '正在创建…' : '创建协作空间'}
      </button>
      <p className="saas-entry-note">
        已有邀请或账号？<Link href="/client/login">登录客户门户</Link>
      </p>
    </form>
  );
}

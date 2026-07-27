import type { GithubProfile, SocialLink } from '@/types/social';

export const githubProfile = {
  description: '公开代码仓库与项目实验将在完成整理后逐步同步。',
  url: '',
} as const satisfies GithubProfile;

export const socialLinks = [
  { id: 'github', name: 'GitHub', url: '', icon: 'github', enabled: false },
  { id: 'email', name: '邮箱', url: '', icon: 'mail', enabled: false },
  { id: 'linkedin', name: 'LinkedIn', url: '', icon: 'linkedin', enabled: false },
  { id: 'x', name: 'X', url: '', icon: 'x', enabled: false },
  { id: 'xiaohongshu', name: '小红书', url: '', icon: 'xiaohongshu', enabled: false },
  { id: 'douyin', name: '抖音', url: '', icon: 'douyin', enabled: false },
] as const satisfies readonly SocialLink[];

export function getEnabledSocialLinks(): readonly SocialLink[] {
  return socialLinks.filter((link) => link.enabled && link.url.trim().length > 0);
}

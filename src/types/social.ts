export const socialLinkIds = ['github', 'email', 'linkedin', 'x', 'xiaohongshu', 'douyin'] as const;

export type SocialLinkId = (typeof socialLinkIds)[number];

export type SocialLink = Readonly<{
  readonly id: SocialLinkId;
  readonly name: string;
  readonly url: string;
  readonly icon: string;
  readonly enabled: boolean;
}>;

export type GithubProfile = Readonly<{
  readonly username?: string;
  readonly url: string;
  readonly description: string;
}>;

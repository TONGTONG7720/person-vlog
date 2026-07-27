import { ArrowUpRight, GitBranch } from 'lucide-react';

import type { EcosystemUiCopy } from '@/data/open-source';
import type { DeveloperIdentity } from '@/types/open-source';
import type { GithubProfile } from '@/types/social';

export type GithubIdentityProps = Readonly<{
  readonly description: string;
  readonly identity: DeveloperIdentity;
  readonly profile: GithubProfile;
  readonly title: string;
  readonly ui: EcosystemUiCopy;
}>;

export function GithubIdentity({
  description,
  identity,
  profile,
  title,
  ui,
}: GithubIdentityProps): React.JSX.Element {
  const hasGithubUrl = profile.url.trim().length > 0;

  return (
    <article aria-labelledby="github-identity-heading" className="ecosystem-github-identity">
      <div className="ecosystem-github-copy">
        <p className="ecosystem-kicker">GITHUB / CODE IDENTITY</p>
        <div className="mt-4 flex items-center gap-3">
          <GitBranch aria-hidden="true" className="text-cyan size-5" strokeWidth={1.5} />
          <h3 className="ecosystem-subheading" id="github-identity-heading">
            {title}
          </h3>
        </div>
        <p className="ecosystem-github-description">{description}</p>
        <ul aria-label={ui.githubLabelsAria} className="ecosystem-github-labels">
          {identity.labels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>

      <div className="ecosystem-identity-card">
        <p className="ecosystem-identity-name">{identity.name}</p>
        <p className="ecosystem-identity-role">{identity.role}</p>
        <ul aria-label={ui.technologiesAria} className="ecosystem-identity-technologies">
          {identity.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
        <p className="ecosystem-identity-statement">{identity.statement}</p>
        {hasGithubUrl ? (
          <a className="ecosystem-inline-link" href={profile.url} rel="noreferrer" target="_blank">
            {ui.viewGithub}
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
          </a>
        ) : (
          <p className="ecosystem-identity-note">{profile.description}</p>
        )}
      </div>
    </article>
  );
}

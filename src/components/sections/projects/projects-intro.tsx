import { Reveal } from '@/components/animation/reveal';

export type ProjectsIntroProps = Readonly<{
  text: string;
}>;

export function ProjectsIntro({ text }: ProjectsIntroProps): React.JSX.Element {
  return (
    <Reveal className="projects-intro" variant="fade-up">
      <p>{text}</p>
    </Reveal>
  );
}

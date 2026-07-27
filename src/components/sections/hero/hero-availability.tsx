import type { HeroAvailability as HeroAvailabilityData } from '@/config/home';

export type HeroAvailabilityProps = Readonly<{
  availability: HeroAvailabilityData;
}>;

export function HeroAvailability({ availability }: HeroAvailabilityProps): React.JSX.Element {
  const label = availability.available
    ? availability.availableLabel
    : availability.unavailableLabel;

  return (
    <p className="hero-availability" data-available={availability.available} data-hero-availability>
      <span aria-hidden="true" className="hero-availability-indicator" />
      <span>{label}</span>
    </p>
  );
}

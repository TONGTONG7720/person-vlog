import { Send } from 'lucide-react';

import { Button } from '@/components/ui/button';

export type SubmitButtonProps = Readonly<{
  readonly isSubmitting: boolean;
  readonly label: string;
  readonly loadingLabel: string;
}>;

export function SubmitButton({
  isSubmitting,
  label,
  loadingLabel,
}: SubmitButtonProps): React.JSX.Element {
  return (
    <Button
      className="contact-submit-button min-h-[var(--form-control-height)]"
      icon={<Send aria-hidden="true" size={17} strokeWidth={1.7} />}
      iconPosition="end"
      loading={isSubmitting}
      type="submit"
    >
      {isSubmitting ? loadingLabel : label}
    </Button>
  );
}

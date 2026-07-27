import { CheckCircle2 } from 'lucide-react';

export type SuccessMessageProps = Readonly<{
  readonly message: string;
}>;

export function SuccessMessage({ message }: SuccessMessageProps): React.JSX.Element {
  return (
    <div aria-live="polite" className="contact-success-message" role="status">
      <CheckCircle2 aria-hidden="true" size={22} strokeWidth={1.7} />
      <p>{message}</p>
    </div>
  );
}

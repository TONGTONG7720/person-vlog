import type { ServiceCategory } from '@/types/service';
import type { CrmLeadSource } from '@/types/crm';

export const contactBudgets = [
  'undecided',
  'under-5k',
  'five-to-twenty-k',
  'over-twenty-k',
  'scope-based',
] as const;

export const contactTimelines = [
  'exploring',
  'soon',
  'one-to-three-months',
  'over-three-months',
] as const;

export type ContactBudget = (typeof contactBudgets)[number];
export type ContactTimeline = (typeof contactTimelines)[number];

export type ContactFormData = Readonly<{
  readonly name: string;
  readonly email: string;
  readonly company?: string;
  readonly service: ServiceCategory;
  readonly source?: CrmLeadSource;
  readonly budget?: ContactBudget;
  readonly timeline?: ContactTimeline;
  readonly message: string;
}>;

export type ContactApiResponse =
  | Readonly<{
      readonly kind: 'accepted';
      readonly message: string;
    }>
  | Readonly<{
      readonly kind: 'rejected';
      readonly message: string;
    }>;

export type ContactSelectOption<Value extends string> = Readonly<{
  readonly label: string;
  readonly value: Value;
}>;

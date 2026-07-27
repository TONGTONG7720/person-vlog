import { redirect } from 'next/navigation';

export default function CrmIndexPage(): never {
  redirect('/admin/crm/dashboard');
}

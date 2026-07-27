export { default, generateMetadata, generateStaticParams } from '@/app/projects/[slug]/page';

export const dynamic = 'force-dynamic';
export const revalidate = 3_600;

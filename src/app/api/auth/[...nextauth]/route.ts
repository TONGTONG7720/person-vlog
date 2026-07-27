import NextAuth from 'next-auth';

import { adminAuthOptions } from '@/server/cms/auth';

const handler = NextAuth(adminAuthOptions);

export { handler as GET, handler as POST };

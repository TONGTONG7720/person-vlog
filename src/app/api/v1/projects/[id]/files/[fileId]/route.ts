import { readPrivateProjectFile } from '@/server/saas/file-storage';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';
import { getSaasProjectFileDownload } from '@/server/saas/project-documents';
import { SaasResourceNotFoundError } from '@/server/saas/project-errors';

export const runtime = 'nodejs';

type FileRouteContext = Readonly<{
  readonly params: Promise<Readonly<{ readonly fileId: string; readonly id: string }>>;
}>;

export async function GET(request: Request, routeContext: FileRouteContext): Promise<Response> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  try {
    const { fileId, id } = await routeContext.params;
    const document = await getSaasProjectFileDownload(contextResult.context, id, fileId);

    if (document.pathname === null) {
      throw new SaasResourceNotFoundError();
    }

    const file = await readPrivateProjectFile(document.pathname);

    return new Response(file.stream, {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(document.title)}`,
        'Content-Type': document.contentType ?? 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

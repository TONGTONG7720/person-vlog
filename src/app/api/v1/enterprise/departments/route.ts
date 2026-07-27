import { NextResponse } from 'next/server';

import {
  createEnterpriseDepartment,
  getEnterpriseDepartments,
} from '@/server/enterprise/structure';
import { enterpriseDepartmentSchema } from '@/server/enterprise/validation';
import { getSaasApiContext, saasApiErrorResponse } from '@/server/saas/api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  try {
    return NextResponse.json({
      departments: await getEnterpriseDepartments(contextResult.context),
    });
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const contextResult = await getSaasApiContext(request);

  if (contextResult.kind === 'unauthorized') {
    return contextResult.response;
  }

  const payload = await readJson(request);
  const parsed = enterpriseDepartmentSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: '部门名称不正确。' }, { status: 400 });
  }

  try {
    return NextResponse.json(
      { department: await createEnterpriseDepartment(contextResult.context, parsed.data.name) },
      { status: 201 },
    );
  } catch (error) {
    return saasApiErrorResponse(error);
  }
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

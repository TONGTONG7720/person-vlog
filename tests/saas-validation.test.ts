import { describe, expect, it } from 'vitest';

import {
  createProjectTaskSchema,
  createWorkspaceSchema,
  projectFileSchema,
} from '../src/server/saas/validation';

describe('SaaS 输入边界', () => {
  it('接受有组织上下文的工作区创建请求', () => {
    expect(
      createWorkspaceSchema.safeParse({
        name: '客户交付',
        organizationId: 'organization-1',
        slug: 'client-delivery',
      }).success,
    ).toBe(true);
  });

  it('拒绝没有组织上下文的协作任务', () => {
    expect(
      createProjectTaskSchema.safeParse({
        projectId: 'project-1',
        title: '确认需求范围',
      }).success,
    ).toBe(false);
  });

  it('拒绝不在白名单内的项目文件类型', () => {
    expect(
      projectFileSchema.safeParse({
        contentType: 'application/x-msdownload',
        fileName: 'unsafe.exe',
        size: 1024,
      }).success,
    ).toBe(false);
  });
});

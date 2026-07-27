import { describe, expect, it } from 'vitest';

import {
  buildSaasOrganizationHref,
  formatSaasDate,
  projectTaskStatusLabels,
  workspaceProjectStatusLabels,
} from '../src/lib/saas-presentation';

describe('SaaS 客户门户展示映射', () => {
  it('在项目链接中保留当前组织上下文', () => {
    expect(buildSaasOrganizationHref('/dashboard/projects/project-1', 'acme-studio')).toBe(
      '/dashboard/projects/project-1?organization=acme-studio',
    );
  });

  it('为客户可见的项目与任务状态提供文字标签', () => {
    expect(workspaceProjectStatusLabels.DEVELOPMENT).toBe('开发中');
    expect(projectTaskStatusLabels.REVIEW).toBe('待确认');
  });

  it('为缺失的可选日期提供稳定文案', () => {
    expect(formatSaasDate(undefined)).toBe('未设置');
  });
});

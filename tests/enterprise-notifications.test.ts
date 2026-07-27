import { describe, expect, it } from 'vitest';

import { getEnterpriseAdminNotification } from '../src/server/enterprise/notifications';

describe('Enterprise 管理员通知', () => {
  it('为成员加入、角色变更和安全事件生成明确的通知内容', () => {
    expect(getEnterpriseAdminNotification('member.joined')).toEqual({
      content: '企业空间有新成员加入，请确认部门与资源授权范围。',
      kind: 'ENTERPRISE_MEMBER_JOINED',
      title: '新成员加入企业空间',
    });
    expect(getEnterpriseAdminNotification('membership.role.changed')).toEqual({
      content: '成员角色或部门权限已变更，请复核最小权限原则。',
      kind: 'ENTERPRISE_ROLE_CHANGED',
      title: '成员权限已变更',
    });
    expect(getEnterpriseAdminNotification('security.event')).toEqual({
      content: '检测到需要关注的企业安全事件，请在安全中心查看详情。',
      kind: 'ENTERPRISE_SECURITY_EVENT',
      title: '企业安全事件',
    });
  });
});

import { describe, expect, it } from 'vitest';

import {
  aiNativeAppLifecycleRequestSchema,
  createAiNativeAppRequestSchema,
} from '../src/server/saas/ai-native-app-validation';

describe('AI 原生应用输入边界', () => {
  it('接受由对话、知识与工作流区块组成的企业知识应用', () => {
    const result = createAiNativeAppRequestSchema.safeParse({
      accessRules: [{ kind: 'ALL_MEMBERS' }],
      blocks: [
        {
          config: { welcomeMessage: '请输入与员工手册相关的问题。' },
          id: 'chat-1',
          position: { x: 80, y: 80 },
          type: 'chat',
        },
        {
          config: { source: 'workspace-knowledge' },
          id: 'knowledge-1',
          position: { x: 360, y: 80 },
          type: 'knowledge',
        },
        {
          config: { workflowName: '知识检索与回答' },
          id: 'workflow-1',
          position: { x: 640, y: 80 },
          type: 'workflow',
        },
      ],
      config: {
        model: 'enterprise-default',
        systemPrompt: '只依据当前企业已授权知识回答；无法确认时明确说明。',
      },
      description: '为员工提供受权限控制的内部知识问答。',
      name: '员工知识助手',
      slug: 'employee-knowledge',
      type: 'KNOWLEDGE',
      workflow: {
        edges: [
          { id: 'edge-input-agent', source: 'input-1', target: 'agent-1' },
          { id: 'edge-agent-knowledge', source: 'agent-1', target: 'knowledge-1' },
          { id: 'edge-knowledge-output', source: 'knowledge-1', target: 'output-1' },
        ],
        nodes: [
          {
            id: 'input-1',
            label: '员工提问',
            position: { x: 0, y: 120 },
            type: 'input',
          },
          {
            id: 'agent-1',
            label: '知识回答 Agent',
            position: { x: 220, y: 120 },
            type: 'agent',
          },
          {
            id: 'knowledge-1',
            label: '企业知识检索',
            position: { x: 460, y: 120 },
            type: 'knowledge',
          },
          {
            id: 'output-1',
            label: '可引用的回答',
            position: { x: 700, y: 120 },
            type: 'output',
          },
        ],
      },
      workspaceId: 'workspace-1',
    });

    expect(result.success).toBe(true);
  });

  it('拒绝指向不存在节点的工作流连接', () => {
    const result = createAiNativeAppRequestSchema.safeParse({
      accessRules: [{ kind: 'ALL_MEMBERS' }],
      blocks: [
        { config: {}, id: 'chat-1', position: { x: 0, y: 0 }, type: 'chat' },
        { config: {}, id: 'workflow-1', position: { x: 240, y: 0 }, type: 'workflow' },
      ],
      config: { model: 'enterprise-default', systemPrompt: '只回答当前企业内已授权的资料。' },
      name: '无效流程',
      slug: 'invalid-workflow',
      type: 'WORKFLOW',
      workflow: {
        edges: [{ id: 'missing', source: 'input-1', target: 'not-exists' }],
        nodes: [
          { id: 'input-1', label: '输入', position: { x: 0, y: 0 }, type: 'input' },
          { id: 'output-1', label: '输出', position: { x: 240, y: 0 }, type: 'output' },
        ],
      },
      workspaceId: 'workspace-1',
    });

    expect(result.success).toBe(false);
  });

  it('只接受明确的 AI App 生命周期动作', () => {
    expect(aiNativeAppLifecycleRequestSchema.safeParse({ action: 'publish' }).success).toBe(true);
    expect(aiNativeAppLifecycleRequestSchema.safeParse({ action: 'activate-now' }).success).toBe(
      false,
    );
  });
});

'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Archive,
  Blocks,
  Bot,
  CheckCircle2,
  CirclePlay,
  FlaskConical,
  GripVertical,
  Plus,
  Save,
  Send,
  Settings2,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  aiAppBlockTypes,
  aiAppTypes,
  type AiAppAccessRule,
  type AiAppBlockType,
  type AiAppLifecycleAction,
  type AiAppLifecycleStatus,
  type AiAppType,
  type AiAppWorkflowDefinition,
} from '@/ai/blocks/contracts';
import { AiAppChat } from '@/components/saas/ai-app-chat';
import type {
  AiAppBuilderAccessSubjects,
  AiAppBuilderDraft,
  AiAppBuilderExistingApp,
  AiAppBuilderTemplate,
  AiAppBuilderTool,
  AiAppBuilderWorkspace,
} from '@/components/saas/ai-app-types';

const AiAppWorkflowCanvas = dynamic(
  () =>
    import('@/components/saas/ai-app-workflow-canvas').then((module) => module.AiAppWorkflowCanvas),
  {
    loading: () => <p className="saas-empty-state">正在加载可视化工作流画布…</p>,
    ssr: false,
  },
);

const appTypeLabels = {
  CUSTOMER: '客服',
  DATA: '数据分析',
  KNOWLEDGE: '知识助手',
  SALES: '销售助手',
  WORKFLOW: '自动化流程',
} as const satisfies Readonly<Record<AiAppType, string>>;

const blockLabels = {
  chat: 'Chat',
  form: 'Form',
  knowledge: 'Knowledge',
  tool: 'Tool',
  workflow: 'Workflow',
} as const satisfies Readonly<Record<AiAppBlockType, string>>;

const lifecycleLabels = {
  ARCHIVED: '已归档',
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  TESTING: '测试中',
} as const satisfies Readonly<Record<AiAppLifecycleStatus, string>>;

const roleOptions = [
  ['OWNER', 'Owner'],
  ['ADMIN', 'Admin'],
  ['ENTERPRISE_OWNER', 'Enterprise Owner'],
  ['SECURITY_ADMIN', 'Security Admin'],
  ['DEPARTMENT_ADMIN', 'Department Admin'],
  ['MEMBER', 'Member'],
  ['VIEWER', 'Viewer'],
] as const;

type AiAppBuilderProps = Readonly<{
  readonly accessSubjects: AiAppBuilderAccessSubjects;
  readonly canManage: boolean;
  readonly existingApp?: AiAppBuilderExistingApp;
  readonly initialTemplateKey?: string;
  readonly organizationSlug: string;
  readonly templates: readonly AiAppBuilderTemplate[];
  readonly tools: readonly AiAppBuilderTool[];
  readonly workspaces: readonly AiAppBuilderWorkspace[];
}>;

type AiAppState = Readonly<{
  readonly activeEnvironment: 'DEVELOPMENT' | 'PRODUCTION';
  readonly id: string | undefined;
  readonly published: boolean;
  readonly status: AiAppLifecycleStatus;
}>;

export function AiAppBuilder({
  accessSubjects,
  canManage,
  existingApp,
  initialTemplateKey,
  organizationSlug,
  templates,
  tools,
  workspaces,
}: AiAppBuilderProps): React.JSX.Element {
  const selectedTemplate = templates.find((template) => template.key === initialTemplateKey);
  const [draft, setDraft] = useState<AiAppBuilderDraft>(() =>
    existingApp === undefined
      ? createInitialDraft(workspaces, selectedTemplate)
      : cloneDraft(existingApp.draft),
  );
  const [appState, setAppState] = useState<AiAppState>({
    activeEnvironment: existingApp?.activeEnvironment ?? 'DEVELOPMENT',
    id: existingApp?.id,
    published: existingApp?.published ?? false,
    status: existingApp?.status ?? 'DRAFT',
  });
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(
    existingApp?.draft.templateKey ?? initialTemplateKey ?? '',
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string>();
  const [accessKind, setAccessKind] = useState<AiAppAccessRule['kind']>('ALL_MEMBERS');
  const [accessSubject, setAccessSubject] = useState('');

  const selectedNode = useMemo(
    () => draft.workflow.nodes.find((node) => node.id === selectedNodeId),
    [draft.workflow.nodes, selectedNodeId],
  );
  const sandboxEndpoint =
    appState.id === undefined || (appState.status !== 'TESTING' && appState.status !== 'PUBLISHED')
      ? undefined
      : `/api/v1/ai/apps/${appState.id}/sandbox?organization=${encodeURIComponent(organizationSlug)}`;

  function updateDraft(patch: Partial<AiAppBuilderDraft>): void {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function updateConfiguration(patch: Partial<AiAppBuilderDraft['config']>): void {
    setDraft((current) => ({ ...current, config: { ...current.config, ...patch } }));
  }

  function applyTemplate(templateKey: string): void {
    setSelectedTemplateKey(templateKey);
    const template = templates.find((item) => item.key === templateKey);

    if (template === undefined) {
      setDraft((current) => {
        const { templateKey: _templateKey, ...withoutTemplate } = current;
        return withoutTemplate;
      });
      return;
    }

    setDraft((current) => ({
      ...cloneTemplateDraft(template, current.workspaceId),
      accessRules: current.accessRules,
    }));
    setFeedback(`已应用「${template.name}」模板。请检查设置后保存草稿。`);
  }

  function addBlock(
    type: AiAppBlockType,
    position?: Readonly<{ readonly x: number; readonly y: number }>,
  ): void {
    setDraft((current) => ({
      ...current,
      blocks: [
        ...current.blocks,
        {
          config: {},
          id: `${type}-${Date.now().toString(36)}-${current.blocks.length + 1}`,
          position: position ?? {
            x: 40 + current.blocks.length * 22,
            y: 56 + current.blocks.length * 18,
          },
          type,
        },
      ],
    }));
  }

  function removeBlock(id: string): void {
    setDraft((current) => {
      const nextBlocks = current.blocks.filter((block) => block.id !== id);

      return nextBlocks.some((block) => block.type === 'chat' || block.type === 'workflow')
        ? { ...current, blocks: nextBlocks }
        : current;
    });
  }

  function updateWorkflow(workflow: AiAppWorkflowDefinition): void {
    updateDraft({ workflow });
  }

  function updateSelectedNodeLabel(label: string): void {
    if (selectedNodeId === undefined) {
      return;
    }

    setDraft((current) => ({
      ...current,
      workflow: {
        ...current.workflow,
        nodes: current.workflow.nodes.map((node) =>
          node.id === selectedNodeId ? { ...node, label } : node,
        ),
      },
    }));
  }

  function removeSelectedNode(): void {
    if (
      selectedNode === undefined ||
      selectedNode.type === 'input' ||
      selectedNode.type === 'output'
    ) {
      return;
    }

    setDraft((current) => ({
      ...current,
      workflow: {
        edges: current.workflow.edges.filter(
          (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id,
        ),
        nodes: current.workflow.nodes.filter((node) => node.id !== selectedNode.id),
      },
    }));
    setSelectedNodeId(undefined);
  }

  function toggleTool(key: string): void {
    updateConfiguration({
      toolKeys: draft.config.toolKeys.includes(key)
        ? draft.config.toolKeys.filter((item) => item !== key)
        : [...draft.config.toolKeys, key],
    });
  }

  function addAccessRule(): void {
    const nextRule = createAccessRule(accessKind, accessSubject);

    if (nextRule === undefined) {
      setFeedback('请选择一个可授权的部门、成员或角色。');
      return;
    }

    if (draft.accessRules.some((rule) => accessRuleKey(rule) === accessRuleKey(nextRule))) {
      setFeedback('该访问范围已经存在。');
      return;
    }

    updateDraft({ accessRules: [...draft.accessRules, nextRule] });
    setAccessSubject('');
  }

  async function persist(): Promise<string | undefined> {
    if (!canManage) {
      setFeedback('当前角色只有使用权限，无法修改 AI 应用。');
      return undefined;
    }

    setIsSaving(true);
    setFeedback(undefined);

    try {
      const url =
        appState.id === undefined
          ? `/api/v1/ai/apps?organization=${encodeURIComponent(organizationSlug)}`
          : `/api/v1/ai/apps/${appState.id}?organization=${encodeURIComponent(organizationSlug)}`;
      const body =
        appState.id === undefined
          ? draft
          : (() => {
              const { workspaceId: _workspaceId, ...update } = draft;
              return update;
            })();
      const response = await fetch(url, {
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        method: appState.id === undefined ? 'POST' : 'PATCH',
      });
      const payload: unknown = await response.json().catch(() => undefined);

      if (!response.ok) {
        setFeedback(getResponseMessage(payload, '保存 AI 应用时出现问题。'));
        return undefined;
      }

      const nextState = getAiAppState(payload);

      if (nextState === undefined || nextState.id === undefined) {
        setFeedback('AI 应用已保存，但返回内容不完整。请刷新后继续。');
        return undefined;
      }

      setAppState(nextState);
      setFeedback('草稿已保存到开发环境。');
      return nextState.id;
    } catch (error) {
      setFeedback(
        error instanceof TypeError ? '网络连接不可用，请稍后重试。' : '保存 AI 应用失败。',
      );
      return undefined;
    } finally {
      setIsSaving(false);
    }
  }

  async function transition(action: AiAppLifecycleAction): Promise<void> {
    const appId = await persist();

    if (appId === undefined) {
      return;
    }

    setIsSaving(true);
    setFeedback(undefined);

    try {
      const response = await fetch(
        `/api/v1/ai/apps/${appId}/lifecycle?organization=${encodeURIComponent(organizationSlug)}`,
        {
          body: JSON.stringify({ action }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        },
      );
      const payload: unknown = await response.json().catch(() => undefined);

      if (!response.ok) {
        setFeedback(getResponseMessage(payload, '应用状态更新失败。'));
        return;
      }

      const nextState = getAiAppState(payload);

      if (nextState !== undefined) {
        setAppState(nextState);
      }

      setFeedback(getLifecycleFeedback(action, draft.slug));
    } catch (error) {
      setFeedback(
        error instanceof TypeError ? '网络连接不可用，请稍后重试。' : '应用状态更新失败。',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="ai-app-builder">
      <header className="ai-app-builder-header">
        <div>
          <p className="saas-kicker">AI APP BUILDER / {appState.activeEnvironment}</p>
          <h1>{draft.name}</h1>
          <p>配置模块、工作流、模型和访问范围；只有测试通过的应用才能发布到组织内部市场。</p>
        </div>
        <div className="ai-app-builder-actions">
          <span data-status={appState.status}>{lifecycleLabels[appState.status]}</span>
          <button
            className="saas-secondary-button"
            disabled={!canManage || isSaving}
            onClick={persist}
            type="button"
          >
            <Save aria-hidden="true" size={16} />
            保存草稿
          </button>
          <button
            className="saas-secondary-button"
            disabled={!canManage || isSaving || appState.status === 'ARCHIVED'}
            onClick={() => transition('start-testing')}
            type="button"
          >
            <FlaskConical aria-hidden="true" size={16} />
            测试应用
          </button>
          <button
            className="saas-primary-button"
            disabled={!canManage || isSaving || appState.status !== 'TESTING'}
            onClick={() => transition('publish')}
            type="button"
          >
            <CirclePlay aria-hidden="true" size={16} />
            发布应用
          </button>
        </div>
      </header>

      {feedback === undefined ? null : (
        <p className="saas-inline-feedback" role="status">
          {feedback}
        </p>
      )}

      <div className="ai-app-builder-grid">
        <aside aria-label="AI 应用组件库" className="ai-app-builder-palette saas-workspace-panel">
          <div className="ai-app-panel-heading">
            <div>
              <p className="saas-kicker">BUILDING BLOCKS</p>
              <h2>组件配置</h2>
            </div>
            <Blocks aria-hidden="true" size={18} />
          </div>
          <label className="ai-app-field">
            <span>从模板开始</span>
            <select
              onChange={(event) => applyTemplate(event.target.value)}
              value={selectedTemplateKey}
            >
              <option value="">空白应用</option>
              {templates.map((template) => (
                <option key={template.key} value={template.key}>
                  {template.name} · {template.category}
                </option>
              ))}
            </select>
          </label>
          <div className="ai-app-template-note">
            <ShieldCheck aria-hidden="true" size={16} />
            <p>模板提供初始配置；知识、工具与权限仍会在当前企业空间中重新验证。</p>
          </div>
          <div className="ai-app-block-library">
            <p>添加 App Block</p>
            {aiAppBlockTypes.map((blockType) => (
              <button
                draggable
                key={blockType}
                onClick={() => addBlock(blockType)}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData(
                    'application/ai-app-builder-item',
                    `block:${blockType}`,
                  );
                }}
                type="button"
              >
                <GripVertical aria-hidden="true" size={15} />
                <span>{blockLabels[blockType]} Block</span>
                <Plus aria-hidden="true" size={15} />
              </button>
            ))}
          </div>
          <div className="ai-app-current-blocks">
            <p>当前应用模块 · {draft.blocks.length}</p>
            <ul>
              {draft.blocks.map((block) => (
                <li key={block.id}>
                  <span>{blockLabels[block.type]}</span>
                  <button
                    aria-label={`移除 ${blockLabels[block.type]} Block`}
                    disabled={
                      draft.blocks.filter(
                        (item) => item.type === 'chat' || item.type === 'workflow',
                      ).length === 1 &&
                      (block.type === 'chat' || block.type === 'workflow')
                    }
                    onClick={() => removeBlock(block.id)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="ai-app-builder-main">
          <AiAppWorkflowCanvas
            onAddBlock={addBlock}
            onChange={updateWorkflow}
            onSelectNode={setSelectedNodeId}
            selectedNodeId={selectedNodeId}
            workflow={draft.workflow}
          />
          <section
            aria-labelledby="ai-app-preview-heading"
            className="ai-app-preview saas-workspace-panel"
          >
            <div className="ai-app-panel-heading">
              <div>
                <p className="saas-kicker">LIVE PREVIEW</p>
                <h2 id="ai-app-preview-heading">应用预览</h2>
              </div>
              <span>{appTypeLabels[draft.type]}</span>
            </div>
            <div className="ai-app-preview-window">
              <Bot aria-hidden="true" size={22} />
              <div>
                <strong>{draft.name}</strong>
                <p>{draft.config.welcomeMessage ?? '你好，我可以根据已授权的信息提供帮助。'}</p>
              </div>
              <div className="ai-app-preview-blocks" aria-label="已启用模块">
                {draft.blocks.map((block) => (
                  <span key={block.id}>{blockLabels[block.type]}</span>
                ))}
              </div>
            </div>
            <AiAppChat
              description="Sandbox 只对 AI 应用管理角色开放，并使用当前 Workspace 的真实模型、知识与计量边界。"
              disabled={!canManage || sandboxEndpoint === undefined}
              endpoint={sandboxEndpoint}
              heading="测试当前应用"
              placeholder="输入一个要在 Sandbox 中验证的问题…"
            />
          </section>
        </section>

        <aside
          aria-label="AI 应用参数设置"
          className="ai-app-builder-inspector saas-workspace-panel"
        >
          <div className="ai-app-panel-heading">
            <div>
              <p className="saas-kicker">APPLICATION SETTINGS</p>
              <h2>参数设置</h2>
            </div>
            <Settings2 aria-hidden="true" size={18} />
          </div>
          <div className="ai-app-fields">
            <label className="ai-app-field">
              <span>应用名称</span>
              <input
                onChange={(event) => updateDraft({ name: event.target.value })}
                value={draft.name}
              />
            </label>
            <label className="ai-app-field">
              <span>应用地址 Slug</span>
              <input
                onChange={(event) => updateDraft({ slug: normalizeSlug(event.target.value) })}
                value={draft.slug}
              />
            </label>
            <label className="ai-app-field">
              <span>应用类型</span>
              <select
                onChange={(event) => updateDraft({ type: event.target.value as AiAppType })}
                value={draft.type}
              >
                {aiAppTypes.map((type) => (
                  <option key={type} value={type}>
                    {appTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>
            <label className="ai-app-field">
              <span>AI Workspace</span>
              <select
                onChange={(event) => updateDraft({ workspaceId: event.target.value })}
                value={draft.workspaceId}
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="ai-app-field ai-app-field-wide">
              <span>应用说明</span>
              <textarea
                onChange={(event) => updateDraft({ description: event.target.value })}
                rows={3}
                value={draft.description}
              />
            </label>
            <label className="ai-app-field ai-app-field-wide">
              <span>欢迎语</span>
              <textarea
                onChange={(event) => updateConfiguration({ welcomeMessage: event.target.value })}
                rows={3}
                value={draft.config.welcomeMessage ?? ''}
              />
            </label>
            <label className="ai-app-field ai-app-field-wide">
              <span>系统行为</span>
              <textarea
                onChange={(event) => updateConfiguration({ systemPrompt: event.target.value })}
                rows={5}
                value={draft.config.systemPrompt}
              />
            </label>
          </div>

          <section aria-labelledby="ai-app-tools-heading" className="ai-app-inspector-section">
            <div className="ai-app-section-heading">
              <h3 id="ai-app-tools-heading">受控工具</h3>
              <small>仅声明连接，不会直接执行外部写入。</small>
            </div>
            {tools.length === 0 ? (
              <p className="saas-empty-state">当前 Workspace 没有已启用的工具。</p>
            ) : (
              <ul className="ai-app-tool-list">
                {tools.map((tool) => (
                  <li key={tool.key}>
                    <label>
                      <input
                        checked={draft.config.toolKeys.includes(tool.key)}
                        onChange={() => toggleTool(tool.key)}
                        type="checkbox"
                      />
                      <span>
                        <strong>{tool.name}</strong>
                        <small>{tool.description}</small>
                      </span>
                    </label>
                    <em data-risk={tool.riskLevel}>{tool.riskLevel}</em>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="ai-app-access-heading" className="ai-app-inspector-section">
            <div className="ai-app-section-heading">
              <h3 id="ai-app-access-heading">使用范围</h3>
              <small>发布后，服务端仍会检查角色、部门和成员规则。</small>
            </div>
            <div className="ai-app-access-composer">
              <select
                onChange={(event) => {
                  setAccessKind(event.target.value as AiAppAccessRule['kind']);
                  setAccessSubject('');
                }}
                value={accessKind}
              >
                <option value="ALL_MEMBERS">所有成员</option>
                <option value="ROLE">按角色</option>
                <option value="DEPARTMENT">按部门</option>
                <option value="MEMBERSHIP">指定成员</option>
              </select>
              {accessKind === 'ALL_MEMBERS' ? null : (
                <select
                  onChange={(event) => setAccessSubject(event.target.value)}
                  value={accessSubject}
                >
                  <option value="">选择范围</option>
                  {getAccessSubjectOptions(accessKind, accessSubjects).map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.label}
                    </option>
                  ))}
                </select>
              )}
              <button className="saas-secondary-button" onClick={addAccessRule} type="button">
                <Plus aria-hidden="true" size={15} />
                添加
              </button>
            </div>
            <ul className="ai-app-access-list">
              {draft.accessRules.map((rule) => (
                <li key={accessRuleKey(rule)}>
                  <span>{describeAccessRule(rule, accessSubjects)}</span>
                  <button
                    aria-label={`移除 ${describeAccessRule(rule, accessSubjects)} 授权`}
                    disabled={draft.accessRules.length === 1}
                    onClick={() =>
                      updateDraft({
                        accessRules: draft.accessRules.filter(
                          (item) => accessRuleKey(item) !== accessRuleKey(rule),
                        ),
                      })
                    }
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="ai-app-node-heading" className="ai-app-inspector-section">
            <div className="ai-app-section-heading">
              <h3 id="ai-app-node-heading">当前节点</h3>
              <small>画布连接会保存为可审计的 JSON。</small>
            </div>
            {selectedNode === undefined ? (
              <p className="saas-empty-state">在中间画布选择一个节点后，可编辑其名称。</p>
            ) : (
              <div className="ai-app-node-editor">
                <label className="ai-app-field">
                  <span>{selectedNode.type} Node</span>
                  <input
                    onChange={(event) => updateSelectedNodeLabel(event.target.value)}
                    value={selectedNode.label}
                  />
                </label>
                <button
                  className="saas-secondary-button"
                  disabled={selectedNode.type === 'input' || selectedNode.type === 'output'}
                  onClick={removeSelectedNode}
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={15} />
                  删除节点
                </button>
              </div>
            )}
          </section>

          <section
            aria-labelledby="ai-app-delivery-heading"
            className="ai-app-inspector-section ai-app-delivery"
          >
            <div className="ai-app-section-heading">
              <h3 id="ai-app-delivery-heading">交付入口</h3>
              <small>受保护的运行页与 API 都不会暴露模型密钥。</small>
            </div>
            {appState.published ? (
              <Link href={`/app/${draft.slug}?organization=${organizationSlug}`}>
                打开员工运行页 <Send aria-hidden="true" size={14} />
              </Link>
            ) : (
              <p>完成 Sandbox 测试后，发布按钮会生成员工使用入口。</p>
            )}
            <code>
              {appState.id === undefined
                ? '保存应用后生成 API 调用地址。'
                : `POST /api/v1/apps/${appState.id}/run`}
            </code>
            <p>该 API 需要当前组织的 Bearer API Key，且仅对“所有成员”范围的已发布应用开放。</p>
            <code>{`<iframe src="/app/${draft.slug}?organization=${organizationSlug}" title="${draft.name}"></iframe>`}</code>
            <p>嵌入入口复用企业登录态；面向互联网的匿名客服组件需要单独的公开身份与风控配置。</p>
          </section>

          {appState.status === 'ARCHIVED' ? (
            <button
              className="saas-secondary-button ai-app-archive-action"
              disabled={!canManage || isSaving}
              onClick={() => transition('restore-draft')}
              type="button"
            >
              <CheckCircle2 aria-hidden="true" size={16} />
              恢复为草稿
            </button>
          ) : (
            <button
              className="saas-secondary-button ai-app-archive-action"
              disabled={!canManage || isSaving}
              onClick={() => transition('archive')}
              type="button"
            >
              <Archive aria-hidden="true" size={16} />
              归档应用
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}

function createInitialDraft(
  workspaces: readonly AiAppBuilderWorkspace[],
  template: AiAppBuilderTemplate | undefined,
): AiAppBuilderDraft {
  const workspaceId = workspaces[0]?.id ?? '';

  return template === undefined
    ? {
        accessRules: [{ kind: 'ALL_MEMBERS' }],
        blocks: [{ config: {}, id: 'chat-1', position: { x: 56, y: 56 }, type: 'chat' }],
        config: {
          model: 'enterprise-default',
          similarityThreshold: 0.12,
          systemPrompt:
            '你是企业 AI 应用助手。仅根据当前 Workspace 中已授权的资料回答；信息不足时说明边界。',
          temperature: 0.2,
          toolKeys: [],
          topK: 5,
          welcomeMessage: '你好，我可以帮助你处理当前企业空间内的已授权问题。',
        },
        description: '一个从可控工作流开始的企业 AI 应用。',
        name: '新的 AI 应用',
        slug: 'new-ai-app',
        type: 'KNOWLEDGE',
        workflow: {
          edges: [
            { id: 'input-agent', source: 'input-1', target: 'agent-1' },
            { id: 'agent-output', source: 'agent-1', target: 'output-1' },
          ],
          nodes: [
            { id: 'input-1', label: '用户输入', position: { x: 30, y: 140 }, type: 'input' },
            { id: 'agent-1', label: 'AI Agent', position: { x: 260, y: 140 }, type: 'agent' },
            { id: 'output-1', label: '输出结果', position: { x: 500, y: 140 }, type: 'output' },
          ],
        },
        workspaceId,
      }
    : cloneTemplateDraft(template, workspaceId);
}

function cloneTemplateDraft(
  template: AiAppBuilderTemplate,
  workspaceId: string,
): AiAppBuilderDraft {
  return {
    accessRules: [{ kind: 'ALL_MEMBERS' }],
    blocks: template.blocks.map((block) => ({
      ...block,
      config: { ...block.config },
      position: { ...block.position },
    })),
    config: { ...template.config, toolKeys: [...template.config.toolKeys] },
    description: template.description,
    name: template.name,
    slug: normalizeSlug(template.key),
    templateKey: template.key,
    type: template.type,
    workflow: {
      edges: template.workflow.edges.map((edge) => ({ ...edge })),
      nodes: template.workflow.nodes.map((node) => ({ ...node, position: { ...node.position } })),
    },
    workspaceId,
  };
}

function cloneDraft(draft: AiAppBuilderDraft): AiAppBuilderDraft {
  return {
    ...draft,
    accessRules: draft.accessRules.map((rule) => ({ ...rule })),
    blocks: draft.blocks.map((block) => ({
      ...block,
      config: { ...block.config },
      position: { ...block.position },
    })),
    config: { ...draft.config, toolKeys: [...draft.config.toolKeys] },
    workflow: {
      edges: draft.workflow.edges.map((edge) => ({ ...edge })),
      nodes: draft.workflow.nodes.map((node) => ({ ...node, position: { ...node.position } })),
    },
  };
}

function normalizeSlug(value: string): string {
  return value
    .toLocaleLowerCase('en-US')
    .replaceAll(/[^a-z0-9]+/gu, '-')
    .replaceAll(/(^-|-$)/gu, '')
    .slice(0, 80);
}

function createAccessRule(
  kind: AiAppAccessRule['kind'],
  subject: string,
): AiAppAccessRule | undefined {
  if (kind === 'ALL_MEMBERS') {
    return { kind };
  }

  if (subject === '') {
    return undefined;
  }

  return { kind, subject };
}

function accessRuleKey(rule: AiAppAccessRule): string {
  return rule.kind === 'ALL_MEMBERS' ? rule.kind : `${rule.kind}:${rule.subject}`;
}

function getAccessSubjectOptions(
  kind: Exclude<AiAppAccessRule['kind'], 'ALL_MEMBERS'>,
  subjects: AiAppBuilderAccessSubjects,
): readonly Readonly<{ readonly id: string; readonly label: string }>[] {
  switch (kind) {
    case 'ROLE':
      return roleOptions.map(([id, label]) => ({ id, label }));
    case 'DEPARTMENT':
      return subjects.departments;
    case 'MEMBERSHIP':
      return subjects.memberships;
  }
}

function describeAccessRule(rule: AiAppAccessRule, subjects: AiAppBuilderAccessSubjects): string {
  if (rule.kind === 'ALL_MEMBERS') {
    return '所有当前企业成员';
  }

  if (rule.kind === 'ROLE') {
    return `角色 · ${roleOptions.find(([id]) => id === rule.subject)?.[1] ?? rule.subject}`;
  }

  const collection = rule.kind === 'DEPARTMENT' ? subjects.departments : subjects.memberships;
  const label = collection.find((subject) => subject.id === rule.subject)?.label ?? rule.subject;

  return `${rule.kind === 'DEPARTMENT' ? '部门' : '成员'} · ${label}`;
}

function getResponseMessage(payload: unknown, fallback: string): string {
  return isRecord(payload) && typeof payload['message'] === 'string'
    ? payload['message']
    : fallback;
}

function getAiAppState(payload: unknown): AiAppState | undefined {
  if (!isRecord(payload) || !isRecord(payload['app'])) {
    return undefined;
  }

  const app = payload['app'];

  return typeof app['id'] === 'string' &&
    isLifecycleStatus(app['status']) &&
    typeof app['published'] === 'boolean' &&
    (app['activeEnvironment'] === 'DEVELOPMENT' || app['activeEnvironment'] === 'PRODUCTION')
    ? {
        activeEnvironment: app['activeEnvironment'],
        id: app['id'],
        published: app['published'],
        status: app['status'],
      }
    : undefined;
}

function getLifecycleFeedback(action: AiAppLifecycleAction, slug: string): string {
  switch (action) {
    case 'save-draft':
      return '草稿已保存。';
    case 'start-testing':
      return '应用已进入测试环境，现在可以在 Sandbox 中验证真实回答。';
    case 'publish':
      return `应用已发布，可通过 /app/${slug} 在当前企业中使用。`;
    case 'archive':
      return '应用已归档，助手和工作流已停止运行。';
    case 'restore-draft':
      return '应用已恢复到开发草稿。';
  }
}

function isLifecycleStatus(value: unknown): value is AiAppLifecycleStatus {
  return value === 'DRAFT' || value === 'TESTING' || value === 'PUBLISHED' || value === 'ARCHIVED';
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null;
}

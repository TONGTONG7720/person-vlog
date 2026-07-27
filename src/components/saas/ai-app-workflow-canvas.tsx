'use client';

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  ReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type ReactFlowInstance,
} from '@xyflow/react';
import { Network, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import {
  aiAppBlockTypes,
  aiWorkflowCanvasNodeTypes,
  type AiAppBlockType,
  type AiAppWorkflowDefinition,
  type AiWorkflowCanvasNodeType,
} from '@/ai/blocks/contracts';

type FlowNodeData = Readonly<{
  readonly label: string;
  readonly nodeType: AiWorkflowCanvasNodeType;
}>;

type FlowNode = Node<FlowNodeData>;

type AiAppWorkflowCanvasProps = Readonly<{
  readonly onAddBlock: (type: AiAppBlockType, position: Readonly<{ x: number; y: number }>) => void;
  readonly onChange: (workflow: AiAppWorkflowDefinition) => void;
  readonly onSelectNode: (nodeId: string | undefined) => void;
  readonly selectedNodeId: string | undefined;
  readonly workflow: AiAppWorkflowDefinition;
}>;

export function AiAppWorkflowCanvas({
  onAddBlock,
  onChange,
  onSelectNode,
  selectedNodeId,
  workflow,
}: AiAppWorkflowCanvasProps): React.JSX.Element {
  const [instance, setInstance] = useState<ReactFlowInstance<FlowNode, Edge> | undefined>();
  const nodes = useMemo(() => toFlowNodes(workflow), [workflow]);
  const edges = useMemo(() => toFlowEdges(workflow), [workflow]);

  const updateWorkflow = useCallback(
    (nextNodes: readonly FlowNode[], nextEdges: readonly Edge[]) => {
      onChange({
        edges: nextEdges.flatMap((edge) =>
          edge.source === '' || edge.target === ''
            ? []
            : [{ id: edge.id, source: edge.source, target: edge.target }],
        ),
        nodes: nextNodes.map((node) => ({
          id: node.id,
          label: node.data.label,
          position: node.position,
          type: node.data.nodeType,
        })),
      });
    },
    [onChange],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      const nextNodes = applyNodeChanges(changes, nodes);
      const removedSelectedNode = !nextNodes.some((node) => node.id === selectedNodeId);

      if (removedSelectedNode) {
        onSelectNode(undefined);
      }

      updateWorkflow(nextNodes, edges);
    },
    [edges, nodes, onSelectNode, selectedNodeId, updateWorkflow],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      updateWorkflow(nodes, applyEdgeChanges(changes, edges));
    },
    [edges, nodes, updateWorkflow],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === null || connection.target === null) {
        return;
      }

      const edgeId = `edge-${connection.source}-${connection.target}`;
      updateWorkflow(nodes, addEdge({ ...connection, id: edgeId }, edges));
    },
    [edges, nodes, updateWorkflow],
  );

  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLButtonElement>, value: string) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/ai-app-builder-item', value);
    },
    [],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (instance === undefined) {
        return;
      }

      const value = event.dataTransfer.getData('application/ai-app-builder-item');
      const position = instance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const nodeType = aiWorkflowCanvasNodeTypes.find((item) => value === `node:${item}`);

      if (nodeType !== undefined) {
        const nextNode: FlowNode = {
          data: { label: getNodeLabel(nodeType), nodeType },
          id: createCanvasId(nodeType, nodes),
          position,
          type: 'default',
        };
        updateWorkflow([...nodes, nextNode], edges);
        onSelectNode(nextNode.id);
        return;
      }

      const blockType = aiAppBlockTypes.find((item) => value === `block:${item}`);

      if (blockType !== undefined) {
        onAddBlock(blockType, position);
      }
    },
    [edges, instance, nodes, onAddBlock, onSelectNode, updateWorkflow],
  );

  return (
    <section aria-labelledby="ai-app-workflow-heading" className="ai-app-workflow-canvas">
      <header className="ai-app-workflow-header">
        <div>
          <p className="saas-kicker">WORKFLOW CANVAS</p>
          <h2 id="ai-app-workflow-heading">应用执行路径</h2>
        </div>
        <p>
          <Network aria-hidden="true" size={16} />
          节点连接仅定义声明式流程；外部写入仍需审批与工具适配器。
        </p>
      </header>
      <div
        className="ai-app-react-flow"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <ReactFlow<FlowNode, Edge>
          edges={edges}
          fitView
          nodes={nodes}
          onConnect={handleConnect}
          onEdgesChange={handleEdgesChange}
          onInit={setInstance}
          onNodeClick={(_, node) => onSelectNode(node.id)}
          onNodesChange={handleNodesChange}
          onPaneClick={() => onSelectNode(undefined)}
        >
          <Background gap={20} size={1} />
          <Controls aria-label="工作流画布控制" showInteractive={false} />
        </ReactFlow>
      </div>
      <div aria-label="向工作流添加节点" className="ai-app-canvas-node-actions">
        {aiWorkflowCanvasNodeTypes.map((nodeType) => (
          <button
            draggable
            key={nodeType}
            onClick={() => {
              const nextNode: FlowNode = {
                data: { label: getNodeLabel(nodeType), nodeType },
                id: createCanvasId(nodeType, nodes),
                position: { x: 96 + nodes.length * 28, y: 104 + nodes.length * 24 },
                type: 'default',
              };
              updateWorkflow([...nodes, nextNode], edges);
              onSelectNode(nextNode.id);
            }}
            onDragStart={(event) => handleDragStart(event, `node:${nodeType}`)}
            type="button"
          >
            <Plus aria-hidden="true" size={14} />
            <span>{getNodeLabel(nodeType)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function toFlowNodes(workflow: AiAppWorkflowDefinition): FlowNode[] {
  return workflow.nodes.map((node) => ({
    data: { label: node.label, nodeType: node.type },
    id: node.id,
    position: node.position,
    type: 'default',
  }));
}

function toFlowEdges(workflow: AiAppWorkflowDefinition): Edge[] {
  return workflow.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
  }));
}

function createCanvasId(type: AiWorkflowCanvasNodeType, nodes: readonly FlowNode[]): string {
  return `${type}-${nodes.length + 1}-${Date.now().toString(36)}`;
}

function getNodeLabel(type: AiWorkflowCanvasNodeType): string {
  switch (type) {
    case 'input':
      return '用户输入';
    case 'agent':
      return 'AI Agent';
    case 'knowledge':
      return '知识检索';
    case 'tool':
      return '受控工具';
    case 'output':
      return '输出结果';
  }
}

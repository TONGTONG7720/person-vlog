# AI Enterprise Operating System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use inline execution task-by-task. The user has explicitly requested execution in the current workspace.

**Goal:** Extend the existing multi-tenant AI platform into a safe, auditable Enterprise AI Operating System (AIOS) with orchestration, agent teams, knowledge graph, workflows, approvals, observability, governance, and a usable workspace UI.

**Architecture:** Reuse `AiWorkspace` as the tenant-scoped AIOS boundary, existing RAG retrieval for knowledge, existing SaaS RBAC/API keys/audit logging for authorization, and add AIOS records that carry enterprise, organization, and workspace identifiers. Orchestration writes durable task and trace records; write-capable tools become pending approvals rather than executing automatically. The first queue implementation is database-backed job state so the system runs without a Redis dependency; a later worker adapter can dequeue the same task records.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma/PostgreSQL, Zod, Vitest, Lucide, existing SaaS AI/RAG/enterprise modules.

## Global Constraints

- Every AIOS resource query must include `enterpriseId`, `organizationId`, and when applicable `workspaceId`.
- Browser code must never receive model credentials or execute tools directly.
- `read` tools may execute only after a permission check; `write` and `high` risk tools must create an approval request first.
- Keep the existing `AiWorkspace`, `AiAssistant`, RAG, API-key, audit, and billing behavior intact.
- Do not require Redis or BullMQ for the local project to start; expose durable queued states for a future worker adapter.
- Use targeted tests for the new contracts, then run the project verification requested by the phase.

---

### Task 1: Define the AIOS persistence and contract boundary

**Files:**

- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260727000000_add_ai_enterprise_operating_system/migration.sql`
- Create: `src/ai/operating-system/contracts.ts`
- Test: `tests/ai-operating-system-contracts.test.ts`

**Interfaces:**

- Produces tenant-scoped models for agents, memories, graph entities/relations, workflows/runs, employees, tools, approvals, task runs/traces, reports, and governance policies.
- Produces literal-union contracts for agent role, task status, workflow node, tool risk, approval state, and trace event type.

- [ ] Write a failing contract test that expects the five default agent roles, approval-before-write policy, and supported workflow node types.
- [ ] Add strict TypeScript contracts using `as const` literal values and exhaustive-safe discriminants.
- [ ] Extend the Prisma schema and add a hand-written PostgreSQL migration with tenant indexes and cascade relations.
- [ ] Run `pnpm.cmd exec vitest run tests/ai-operating-system-contracts.test.ts` and `pnpm.cmd prisma generate`.

### Task 2: Build the Agent Team, Memory, Knowledge Graph, and tool registry policies

**Files:**

- Create: `src/ai/agents/team/default-team.ts`
- Create: `src/ai/memory/agent-memory.ts`
- Create: `src/ai/knowledge-graph/knowledge-graph.ts`
- Create: `src/ai/tools/tool-registry.ts`
- Create: `src/server/saas/ai-operating-system-errors.ts`
- Test: `tests/ai-operating-system-contracts.test.ts`

**Interfaces:**

- `selectAgentTeam(input)` returns an ordered readonly agent-role pipeline.
- `decideToolExecution(input)` returns `execute`, `approval-required`, or `forbidden`.
- `createKnowledgeGraphNamespace(scope)` supplies an organization and workspace-safe namespace.

- [ ] Add failing examples for revenue analysis (`planner → data → writer`), document research (`planner → research → writer`), and a task creation tool requiring approval.
- [ ] Implement deterministic agent selection, graph namespace generation, and the built-in tool catalog (`knowledge.search`, `report.create`, `project.task.create`).
- [ ] Keep API and database-specific calls outside these pure policy modules.
- [ ] Run the focused contract test and confirm the red/green behavior.

### Task 3: Implement durable AIOS service operations

**Files:**

- Create: `src/server/saas/ai-operating-system.ts`
- Create: `src/server/saas/ai-operating-system-overview.ts`
- Create: `src/server/saas/ai-operating-system-validation.ts`
- Modify: `src/server/saas/ai-platform-errors.ts`
- Modify: `src/server/saas/api.ts`
- Test: `tests/ai-operating-system-validation.test.ts`

**Interfaces:**

- `queueAiOperatingSystemTask(context, input)` creates a queued task, ordered trace, and selected agent plan.
- `approveAiOperatingSystemRequest(context, approvalId)` records an approval and moves the related task forward.
- `getAiOperatingSystemOverview(context)` returns only current-tenant overview records.

- [ ] Add tests for Zod request parsing, required workspace ID, safe prompt guard handoff, and invalid workflow node shapes.
- [ ] Validate requests at the boundary, require existing `agent.execute`/`agent.read`/`ai.manage` permissions, and scope every Prisma operation by tenant IDs.
- [ ] Persist agent memories, graph data, workflow runs, approvals, reports, and traces only under the selected AI workspace.
- [ ] Write enterprise audit entries for task queuing, approval decisions, and governance changes.

### Task 4: Implement the orchestrator and workflow runner

**Files:**

- Create: `src/ai/orchestrator/ai-orchestrator.ts`
- Create: `src/ai/workflows/operating-system-workflow.ts`
- Create: `src/ai/queue/task-dispatcher.ts`
- Modify: `scripts/enterprise-worker.mjs`
- Test: `tests/ai-operating-system-orchestrator.test.ts`

**Interfaces:**

- `planAiTask(input)` returns the selected agent team, tool intent, and approval requirement.
- `runAiOperatingSystemWorkflow(input)` appends trace events and returns completed, queued, or approval-required status.
- `dispatchAiTask(input)` retains a queue adapter seam without requiring Redis locally.

- [ ] Write failing tests for successful report planning, high-risk tool approval gating, and cross-workspace denial.
- [ ] Implement a task plan that calls existing RAG only within the chosen workspace and uses a structured report fallback if no model is configured.
- [ ] Create workflow executions that never invoke a write tool before a resolved human approval.
- [ ] Extend the worker heartbeat with explicit AIOS queue capability reporting rather than pretending a missing Redis worker exists.

### Task 5: Expose API and dashboard actions

**Files:**

- Create: `src/app/api/v1/agent/run/route.ts`
- Create: `src/actions/saas/ai-operating-system.ts`
- Modify: `src/components/saas/client-portal-header.tsx`
- Test: `tests/ai-operating-system-api.test.ts`

**Interfaces:**

- `POST /api/v1/agent/run` accepts an API key or signed-in SaaS context and returns a task ID plus task status.
- Server actions submit dashboard tasks and approve/reject only current-tenant approval records.

- [ ] Write failing tests for unauthorized API use and API-key scope validation.
- [ ] Reuse `authenticateAiApiKey`, enterprise gateway rate limiting, and existing plan feature checks.
- [ ] Add AIOS Workspace and Observability portal navigation entries while preserving organization query context.
- [ ] Return safe summaries and IDs, never raw prompts, credentials, or private knowledge content.

### Task 6: Build the AIOS workspace, observability, and governance interfaces

**Files:**

- Create: `src/app/dashboard/ai-workspace/page.tsx`
- Create: `src/app/dashboard/ai-observability/page.tsx`
- Create: `src/app/admin/(protected)/ai-governance/page.tsx`
- Create: `src/components/saas/ai-operating-system-dashboard.tsx`
- Create: `src/components/saas/ai-observability-dashboard.tsx`
- Create: `src/components/admin/ai-governance-dashboard.tsx`
- Create: `src/styles/ai-operating-system.css`
- Modify: `src/app/globals.css`
- Modify: `src/components/admin/admin-navigation.ts`

**Interfaces:**

- AIOS workspace presents agent team, workflow canvas, knowledge graph summary, reports, task composer, pending approvals, and latest traces.
- Observability presents request volume, success/failure counts, tokens, cost, latency, and trace list.
- Governance presents model availability, enabled agents/tools, and approval/audit policy states.

- [ ] Render dashboard state server-side, retaining client code only for interaction affordances and task feedback.
- [ ] Make workflow visualization readable without relying on hover, and make all action controls keyboard accessible.
- [ ] Use empty states when no database or no AIOS data exists; do not hard-code customer content.
- [ ] Visually inspect both dashboard routes at desktop and mobile breakpoints after implementation.

### Task 7: Generate, verify, and report

**Files:**

- Modify: generated Prisma client files only through `pnpm.cmd prisma generate`
- Test: `tests/ai-operating-system-*.test.ts`

- [ ] Run focused AIOS tests.
- [ ] Run `pnpm.cmd typecheck`, `pnpm.cmd lint`, `pnpm.cmd test`, and `pnpm.cmd build` as required by the phase.
- [ ] Resolve newly introduced failures; distinguish pre-existing failures if any exist.
- [ ] Start the app and inspect AIOS UI routes sufficiently to confirm frontend rendering.
- [ ] Provide the requested execution report and stop.

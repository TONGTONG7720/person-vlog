import type {
  ProjectActivityType,
  ProjectDocumentKind,
  ProjectTaskPriority,
  ProjectTaskStatus,
  WorkspaceProjectStatus,
} from '@/generated/prisma/client';

export type PortalOrganization = Readonly<{
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}>;

export type PortalProject = Readonly<{
  readonly description: string | null;
  readonly documentCount: number;
  readonly id: string;
  readonly progress: number;
  readonly status: WorkspaceProjectStatus;
  readonly taskCount: number;
  readonly title: string;
  readonly updatedAt: string;
  readonly workspaceName: string;
}>;

export type PortalTask = Readonly<{
  readonly assigneeEmail: string | undefined;
  readonly description: string | null;
  readonly dueDate: string | undefined;
  readonly id: string;
  readonly priority: ProjectTaskPriority;
  readonly status: ProjectTaskStatus;
  readonly title: string;
}>;

export type PortalDocument = Readonly<{
  readonly content: string | null;
  readonly contentType: string | null;
  readonly createdAt: string;
  readonly id: string;
  readonly kind: ProjectDocumentKind;
  readonly pathname: string | null;
  readonly size: number | null;
  readonly title: string;
  readonly updatedAt: string;
}>;

export type PortalActivity = Readonly<{
  readonly actorEmail: string | undefined;
  readonly content: string;
  readonly createdAt: string;
  readonly id: string;
  readonly type: ProjectActivityType;
}>;

export type WorkspaceProjectView = Readonly<{
  readonly activities: readonly PortalActivity[];
  readonly description: string | null;
  readonly documents: readonly PortalDocument[];
  readonly id: string;
  readonly ownerEmail: string | undefined;
  readonly progress: number;
  readonly status: WorkspaceProjectStatus;
  readonly tasks: readonly PortalTask[];
  readonly title: string;
  readonly workspaceName: string;
}>;

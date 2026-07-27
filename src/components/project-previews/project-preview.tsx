import type { ProjectPreviewType } from '@/types/project';

import { AiChatPreview } from '@/components/project-previews/ai-chat-preview';
import { DigitalDeliveryPreview } from '@/components/project-previews/digital-delivery-preview';
import { KnowledgeRetrievalPreview } from '@/components/project-previews/knowledge-retrieval-preview';
import { StoreDashboardPreview } from '@/components/project-previews/store-dashboard-preview';

export type ProjectPreviewProps = Readonly<{
  previewType: ProjectPreviewType;
}>;

function assertUnreachable(value: never): never {
  throw new Error(`Unsupported project preview: ${value}`);
}

export function ProjectPreview({ previewType }: ProjectPreviewProps): React.JSX.Element {
  switch (previewType) {
    case 'ai-chat':
      return <AiChatPreview />;
    case 'digital-delivery':
      return <DigitalDeliveryPreview />;
    case 'knowledge-retrieval':
      return <KnowledgeRetrievalPreview />;
    case 'store-dashboard':
      return <StoreDashboardPreview />;
    default:
      return assertUnreachable(previewType);
  }
}

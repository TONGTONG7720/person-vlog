import { readContactSource, readFirstUtmAttribution } from '@/lib/utm';
import { normalizeCrmLeadSource } from '@/types/crm';

export function resolveContactLeadSource() {
  const attribution = readFirstUtmAttribution();

  return (
    normalizeCrmLeadSource(attribution.firstSource) ?? normalizeCrmLeadSource(readContactSource())
  );
}

import { describe, expect, it } from 'vitest';

import { MarketplaceInputError } from '../src/server/marketplace/errors';
import { resolveMarketplaceToolRoute } from '../src/server/marketplace/tool-router';

describe('Marketplace Plugin Tool Router', () => {
  it('只解析审核过的最小权限能力，不执行插件代码', () => {
    expect(
      resolveMarketplaceToolRoute({ permission: 'call_api', pluginId: 'plugin_123' }, [
        'read_document',
        'call_api',
      ]),
    ).toEqual({ permission: 'call_api', pluginId: 'plugin_123' });
  });

  it('拒绝未声明或不支持的插件能力', () => {
    expect(() =>
      resolveMarketplaceToolRoute({ permission: 'access_database', pluginId: 'plugin_123' }, [
        'read_document',
      ]),
    ).toThrow(MarketplaceInputError);
    expect(() =>
      resolveMarketplaceToolRoute({ permission: 'root_shell', pluginId: 'plugin_123' }, [
        'root_shell',
      ]),
    ).toThrow(MarketplaceInputError);
  });
});

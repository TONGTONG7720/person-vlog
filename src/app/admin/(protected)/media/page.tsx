import { deleteAdminMedia, uploadAdminMedia } from '@/actions/admin/media';
import { AdminCopyUrlButton } from '@/components/admin/admin-copy-url-button';
import { AdminDeleteForm } from '@/components/admin/admin-delete-form';
import {
  AdminEmptyState,
  AdminFormFeedback,
  AdminPageHeader,
  AdminSetupNotice,
  formatAdminDate,
} from '@/components/admin/admin-page-primitives';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { isCmsStorageConfigured } from '@/server/cms/storage';
import { getAdminMediaAssets } from '@/server/cms/queries';

export default async function AdminMediaPage({
  searchParams,
}: Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>): Promise<React.JSX.Element> {
  const params = await searchParams;
  const [assets, databaseConfigured] = await Promise.all([
    getAdminMediaAssets(),
    Promise.resolve(isCmsDatabaseConfigured()),
  ]);
  const storageConfigured = isCmsStorageConfigured();

  return (
    <>
      <AdminPageHeader
        description="上传项目与博客封面，复制公开 URL 后粘贴到对应内容的封面字段。"
        eyebrow="ASSETS / MEDIA"
        title="图片资源"
      />
      <AdminFormFeedback error={params['error']} success={params['success']} />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      {!storageConfigured ? (
        <p className="admin-setup-notice" role="status">
          图片存储尚未连接。配置 BLOB_READ_WRITE_TOKEN 后可上传 AVIF、JPEG、PNG 或 WebP 图片（最大 4
          MB）。
        </p>
      ) : null}
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">UPLOAD</p>
            <h2>上传图片</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          <form
            action={uploadAdminMedia}
            className="admin-resource-form"
            encType="multipart/form-data"
          >
            <label>
              图片文件
              <input
                accept="image/avif,image/jpeg,image/png,image/webp"
                name="file"
                required
                type="file"
              />
            </label>
            <p className="admin-inline-note">仅支持 AVIF、JPEG、PNG、WebP；文件不超过 4 MB。</p>
            <button
              className="admin-primary-button"
              disabled={!databaseConfigured || !storageConfigured}
              type="submit"
            >
              上传图片
            </button>
          </form>
        </div>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">LIBRARY</p>
            <h2>已上传资源</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          {assets.length === 0 ? (
            <AdminEmptyState>暂无上传图片。图片上传成功后会显示在这里。</AdminEmptyState>
          ) : (
            <div className="admin-media-grid">
              {assets.map((asset) => (
                <article className="admin-media-card" key={asset.id}>
                  {/* 外部 Blob 域名由部署环境决定，原生 img 避免为未知域名生成优化请求。 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={asset.pathname}
                    height={600}
                    loading="lazy"
                    src={asset.url}
                    width={800}
                  />
                  <div className="admin-media-card-content">
                    <code title={asset.pathname}>{asset.pathname}</code>
                    <span>{formatAdminDate(asset.createdAt)}</span>
                    <div className="admin-row-actions">
                      <a
                        className="admin-secondary-button"
                        href={asset.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        查看
                      </a>
                      <AdminCopyUrlButton url={asset.url} />
                      <AdminDeleteForm
                        action={deleteAdminMedia}
                        id={asset.id}
                        resourceLabel={`图片「${asset.pathname}」`}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

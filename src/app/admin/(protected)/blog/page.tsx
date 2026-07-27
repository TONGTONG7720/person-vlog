import { createAdminPost, deleteAdminPost, updateAdminPost } from '@/actions/admin/posts';
import { AdminDeleteForm } from '@/components/admin/admin-delete-form';
import {
  AdminEmptyState,
  AdminFormFeedback,
  AdminPageHeader,
  AdminPagination,
  AdminSearchForm,
  AdminSetupNotice,
  formatAdminDate,
} from '@/components/admin/admin-page-primitives';
import { AdminPostForm } from '@/components/admin/forms/admin-post-form';
import { contentCategoryLabels, normalizeContentCategory } from '@/config/content';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { getAdminListQuery, getAdminPosts } from '@/server/cms/queries';

type BlogPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>;

export default async function AdminBlogPage({
  searchParams,
}: BlogPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const query = getAdminListQuery(params['search'], params['page']);
  const [posts, databaseConfigured] = await Promise.all([
    getAdminPosts(query),
    Promise.resolve(isCmsDatabaseConfigured()),
  ]);

  return (
    <>
      <AdminPageHeader
        description="使用 Markdown / MDX 维护技术文章，并控制公开发布时间。"
        eyebrow="CONTENT / BLOG"
        title="技术博客"
      />
      <AdminFormFeedback error={params['error']} success={params['success']} />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">WRITE</p>
            <h2>新增文章</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          <AdminPostForm action={createAdminPost} submitLabel="保存文章" />
        </div>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">JOURNAL</p>
            <h2>文章列表</h2>
          </div>
          <AdminSearchForm action="/admin/blog" search={query.search} />
        </div>
        {posts.length === 0 ? (
          <div className="admin-panel-body">
            <AdminEmptyState>暂无文章。将一篇项目复盘或技术实践沉淀为第一篇内容。</AdminEmptyState>
          </div>
        ) : (
          <div className="admin-data-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th scope="col">文章</th>
                  <th scope="col">状态</th>
                  <th scope="col">分类</th>
                  <th scope="col">语言</th>
                  <th scope="col">更新时间</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <span className="admin-data-title">
                        {post.title}
                        <small>/{post.slug}</small>
                      </span>
                    </td>
                    <td>
                      <span className="admin-status-badge">
                        {post.published ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td>{contentCategoryLabels[normalizeContentCategory(post.category)]}</td>
                    <td>{post.locale === 'en-US' ? 'EN' : '中文'}</td>
                    <td>
                      <time dateTime={post.updatedAt.toISOString()}>
                        {formatAdminDate(post.updatedAt)}
                      </time>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <details className="admin-details">
                          <summary>编辑</summary>
                          <AdminPostForm
                            action={updateAdminPost}
                            submitLabel="保存文章"
                            values={{
                              canonical: post.canonical,
                              category: normalizeContentCategory(post.category),
                              content: post.content,
                              coverImage: post.coverImage,
                              description: post.description,
                              id: post.id,
                              locale: post.locale === 'en-US' ? 'en-US' : 'zh-CN',
                              keywords: post.keywords,
                              ogImage: post.ogImage,
                              published: post.published,
                              relatedPosts: post.relatedPosts,
                              relatedProjects: post.relatedProjects,
                              relatedServices: post.relatedServices,
                              seoDescription: post.seoDescription,
                              seoTitle: post.seoTitle,
                              slug: post.slug,
                              socialContent: getPostSocialContent(post.socialContent),
                              tags: post.tags,
                              title: post.title,
                              translationGroup: post.translationGroup,
                            }}
                          />
                        </details>
                        <AdminDeleteForm
                          action={deleteAdminPost}
                          id={post.id}
                          resourceLabel={`文章「${post.title}」`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AdminPagination
          itemCount={posts.length}
          page={query.page}
          pathname="/admin/blog"
          search={query.search}
        />
      </section>
    </>
  );
}

function getPostSocialContent(
  value: unknown,
): Readonly<Partial<Record<'douyin' | 'wechat' | 'xiaohongshu', string>>> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;

  const content = {
    ...(typeof record['douyin'] === 'string' ? { douyin: record['douyin'] } : {}),
    ...(typeof record['wechat'] === 'string' ? { wechat: record['wechat'] } : {}),
    ...(typeof record['xiaohongshu'] === 'string' ? { xiaohongshu: record['xiaohongshu'] } : {}),
  };

  return Object.keys(content).length === 0 ? null : content;
}

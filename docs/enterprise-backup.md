# 企业备份、恢复与数据导出

## 备份策略

- 数据库：每天自动逻辑备份、每周保留长期恢复点，并启用 PostgreSQL 服务商的 PITR。
- 文件：对象存储启用版本化和跨区域复制；文件元数据由 PostgreSQL 备份覆盖。
- 知识库：备份 `AiKnowledgeDocument`、`AiVectorDocument`、`AiDocumentJob` 与私有对象路径；恢复后先验证范围，再重新生成必要的索引。
- 密钥：不进入数据库备份。通过部署 Secret Store/KMS 独立轮换与恢复。

## 恢复演练

只在隔离的恢复数据库进行：创建新数据库、还原最近备份、运行只读完整性检查，并用企业管理员账户确认 Organization、Department、Project、Document 与 AuditLog 的 enterprise 范围没有交叉。不要对生产地址运行恢复命令。

## 数据可携带

- 企业安全管理员可导出本组织的审计 CSV。
- Enterprise Owner 可使用受保护的企业数据导出 API 获取成员、项目、文档元数据和知识库元数据；API Key 哈希、SSO secret reference 的值、原始 IP 和支付凭据永不导出。
- 数据删除和恢复请求应记录审计事件，并在执行前确认企业范围、保留策略和法律要求。

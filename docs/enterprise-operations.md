# 企业平台运维索引

阶段二十九的企业部署、恢复和合规操作分别维护在以下文档中：

- [私有部署](./enterprise-deployment.md)：Docker Compose、迁移、SSO 与 Gateway 的配置边界。
- [备份、恢复与导出](./enterprise-backup.md)：数据库、私有文件和知识库的恢复演练及数据可携带范围。
- [合规基础](./enterprise-compliance.md)：本项目已提供的基础控制与需要部署方自行完成的合规事项。

上线前先在隔离环境验证 `.env.enterprise`，再执行 `pnpm prisma:deploy` 或 Compose 的 `migrate` profile。不要对生产库使用 `prisma migrate dev`、`db push` 或手工回滚 SQL。

真实 SAML/OIDC 登录需要企业管理员提供 IdP metadata、回调地址、签名证书或 client secret，并把密钥仅配置在 Secret Store / 环境变量中。应用数据库只保存脱敏的连接元数据和环境变量引用。

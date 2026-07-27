-- Add a locale boundary to public CMS content while preserving existing Chinese entries.
ALTER TABLE "Project"
    ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'zh-CN',
    ADD COLUMN "translationGroup" TEXT;

ALTER TABLE "Post"
    ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'zh-CN',
    ADD COLUMN "translationGroup" TEXT;

ALTER TABLE "Service"
    ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'zh-CN',
    ADD COLUMN "translationGroup" TEXT;

ALTER TABLE "ContentPlan"
    ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'zh-CN';

DROP INDEX IF EXISTS "Project_slug_key";
DROP INDEX IF EXISTS "Post_slug_key";
DROP INDEX IF EXISTS "Service_slug_key";

CREATE UNIQUE INDEX "Project_locale_slug_key" ON "Project"("locale", "slug");
CREATE UNIQUE INDEX "Post_locale_slug_key" ON "Post"("locale", "slug");
CREATE UNIQUE INDEX "Service_locale_slug_key" ON "Service"("locale", "slug");

CREATE INDEX "Project_translationGroup_locale_idx" ON "Project"("translationGroup", "locale");
CREATE INDEX "Post_translationGroup_locale_idx" ON "Post"("translationGroup", "locale");
CREATE INDEX "Service_translationGroup_locale_idx" ON "Service"("translationGroup", "locale");
CREATE INDEX "ContentPlan_locale_status_idx" ON "ContentPlan"("locale", "status");

-- Align the growth CMS database contract with the public content-planning model.
UPDATE "ContentPlan"
SET "keyword" = ''
WHERE "keyword" IS NULL;

ALTER TABLE "ContentPlan"
    ALTER COLUMN "keyword" SET NOT NULL;

ALTER TABLE "Keyword"
    RENAME COLUMN "phrase" TO "keyword";

ALTER TABLE "Keyword"
    RENAME COLUMN "intent" TO "difficulty";

ALTER TABLE "Keyword"
    RENAME COLUMN "notes" TO "volume";

ALTER INDEX "Keyword_phrase_key"
    RENAME TO "Keyword_keyword_key";

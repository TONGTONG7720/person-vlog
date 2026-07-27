-- Enrich public articles with search, relationship, and social-distribution metadata.
ALTER TABLE "Post"
    ADD COLUMN "keywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN "ogImage" TEXT,
    ADD COLUMN "seoTitle" TEXT,
    ADD COLUMN "seoDescription" TEXT,
    ADD COLUMN "canonical" TEXT,
    ADD COLUMN "relatedPosts" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN "relatedProjects" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN "relatedServices" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN "socialContent" JSONB;

CREATE INDEX "Post_category_published_idx" ON "Post"("category", "published");

CREATE TABLE "ContentPlan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "keyword" TEXT,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'idea',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "publishDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPlan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContentPlan_status_publishDate_idx" ON "ContentPlan"("status", "publishDate");
CREATE INDEX "ContentPlan_category_priority_idx" ON "ContentPlan"("category", "priority");

CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "phrase" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "intent" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Keyword_phrase_key" ON "Keyword"("phrase");
CREATE INDEX "Keyword_category_updatedAt_idx" ON "Keyword"("category", "updatedAt");

CREATE TABLE "Newsletter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Newsletter_email_key" ON "Newsletter"("email");
CREATE INDEX "Newsletter_status_createdAt_idx" ON "Newsletter"("status", "createdAt");

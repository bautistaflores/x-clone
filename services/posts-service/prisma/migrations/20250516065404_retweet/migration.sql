/*
  Warnings:

  - You are about to drop the column `is_retweet` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `original_post_id` on the `posts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_original_post_id_fkey";

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "is_retweet",
DROP COLUMN "original_post_id";

-- CreateTable
CREATE TABLE "retweets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "retweeted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retweets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "retweets_user_id_idx" ON "retweets"("user_id");

-- CreateIndex
CREATE INDEX "retweets_post_id_idx" ON "retweets"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "retweets_user_id_post_id_key" ON "retweets"("user_id", "post_id");

-- AddForeignKey
ALTER TABLE "retweets" ADD CONSTRAINT "retweets_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

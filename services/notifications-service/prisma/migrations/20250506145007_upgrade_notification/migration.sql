/*
  Warnings:

  - You are about to drop the column `isRead` on the `notifications` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LIKE', 'COMMENT', 'RETWEET', 'FOLLOW', 'MENTION');

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "isRead";

-- CreateIndex
CREATE INDEX "notifications_toUserId_idx" ON "notifications"("toUserId");

/*
  Warnings:

  - You are about to drop the column `name` on the `author` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `bookmark` table. All the data in the column will be lost.
  - You are about to drop the column `chapterNumber` on the `chapter` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `follow` table. All the data in the column will be lost.
  - The primary key for the `history` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountId` on the `history` table. All the data in the column will be lost.
  - You are about to drop the column `novelId` on the `history` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `notification` table. All the data in the column will be lost.
  - The primary key for the `rating` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountId` on the `rating` table. All the data in the column will be lost.
  - You are about to drop the column `review` on the `rating` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `role_to_permission` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `tag` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(30)`.
  - The primary key for the `view_count` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `date` on the `view_count` table. All the data in the column will be lost.
  - You are about to drop the column `novelId` on the `view_count` table. All the data in the column will be lost.
  - You are about to drop the column `totalViews` on the `view_count` table. All the data in the column will be lost.
  - Added the required column `nickname` to the `author` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `bookmark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `index` to the `chapter` table without a default value. This is not possible if the table is not empty.
  - Made the column `content` on table `chapter` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userId` to the `comment` table without a default value. This is not possible if the table is not empty.
  - Made the column `content` on table `comment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userId` to the `follow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `notification` table without a default value. This is not possible if the table is not empty.
  - Made the column `type` on table `notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `notification` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `categoryId` to the `novel` table without a default value. This is not possible if the table is not empty.
  - Made the column `image` on table `novel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `banner` on table `novel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `novel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `posterId` on table `novel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `permission` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `id` to the `rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `rating` table without a default value. This is not possible if the table is not empty.
  - Made the column `rating` on table `rating` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userId` to the `report` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `report` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `report` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `role` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `id` to the `view_count` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `view_count` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `role_to_permission` DROP FOREIGN KEY `role_to_permission_permissionId_fkey`;

-- DropForeignKey
ALTER TABLE `role_to_permission` DROP FOREIGN KEY `role_to_permission_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `user_to_role` DROP FOREIGN KEY `user_to_role_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `user_to_role` DROP FOREIGN KEY `user_to_role_userId_fkey`;

-- AlterTable
ALTER TABLE `author` DROP COLUMN `name`,
    ADD COLUMN `firstname` VARCHAR(45) NULL,
    ADD COLUMN `lastname` VARCHAR(45) NULL,
    ADD COLUMN `nickname` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `bookmark` DROP COLUMN `accountId`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `chapter` DROP COLUMN `chapterNumber`,
    ADD COLUMN `index` INTEGER UNSIGNED NOT NULL,
    MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `comment` DROP COLUMN `accountId`,
    ADD COLUMN `userId` INTEGER NOT NULL,
    MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `follow` DROP COLUMN `accountId`,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `history` DROP PRIMARY KEY,
    DROP COLUMN `accountId`,
    DROP COLUMN `novelId`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `userId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `notification` DROP COLUMN `accountId`,
    ADD COLUMN `userId` INTEGER NOT NULL,
    MODIFY `type` VARCHAR(25) NOT NULL,
    MODIFY `content` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `novel` ADD COLUMN `categoryId` INTEGER NOT NULL,
    MODIFY `image` VARCHAR(255) NOT NULL,
    MODIFY `banner` VARCHAR(255) NOT NULL,
    MODIFY `state` VARCHAR(50) NULL DEFAULT 'Còn tiếp',
    MODIFY `description` TEXT NOT NULL,
    MODIFY `posterId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `permission` MODIFY `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `description` TEXT NOT NULL,
    MODIFY `updatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `rating` DROP PRIMARY KEY,
    DROP COLUMN `accountId`,
    DROP COLUMN `review`,
    ADD COLUMN `content` TEXT NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `userId` INTEGER NOT NULL,
    MODIFY `rating` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `report` DROP COLUMN `accountId`,
    ADD COLUMN `userId` INTEGER NOT NULL,
    MODIFY `title` VARCHAR(255) NOT NULL,
    MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `role` MODIFY `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `description` TEXT NOT NULL,
    MODIFY `updatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `role_to_permission` DROP COLUMN `updatedAt`,
    ADD COLUMN `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `tag` MODIFY `name` VARCHAR(30) NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `avatar` VARCHAR(100) NULL DEFAULT 'https://staticvn.sangtacvietcdn.xyz/img/useravatar/default.png',
    ALTER COLUMN `gender` DROP DEFAULT,
    MODIFY `blacklist` BOOLEAN NULL DEFAULT false,
    MODIFY `confirmed` BOOLEAN NULL DEFAULT false,
    MODIFY `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `user_to_role` MODIFY `updatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `view_count` DROP PRIMARY KEY,
    DROP COLUMN `date`,
    DROP COLUMN `novelId`,
    DROP COLUMN `totalViews`,
    ADD COLUMN `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `userId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `description` VARCHAR(85) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `novelId` INTEGER NULL,

    INDEX `novelId`(`novelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment_interaction` (
    `commentId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `interactionType` VARCHAR(255) NULL,

    INDEX `userId`(`userId`),
    PRIMARY KEY (`commentId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `bookmark_ibfk_1` ON `bookmark`(`userId`);

-- CreateIndex
CREATE INDEX `bookmark_ibfk_2` ON `bookmark`(`novelId`);

-- CreateIndex
CREATE INDEX `chapter_ibfk_1` ON `chapter`(`novelId`);

-- CreateIndex
CREATE INDEX `comment_ibfk_1` ON `comment`(`novelId`);

-- CreateIndex
CREATE INDEX `comment_ibfk_2` ON `comment`(`userId`);

-- CreateIndex
CREATE INDEX `follow_ibfk_1` ON `follow`(`userId`);

-- CreateIndex
CREATE INDEX `follow_ibfk_2` ON `follow`(`novelId`);

-- CreateIndex
CREATE INDEX `chapterId` ON `history`(`chapterId`);

-- CreateIndex
CREATE INDEX `userId` ON `history`(`userId`);

-- CreateIndex
CREATE INDEX `notification_ibfk_1` ON `notification`(`userId`);

-- CreateIndex
CREATE INDEX `novel_ibfk_1` ON `novel`(`posterId`);

-- CreateIndex
CREATE INDEX `novel_ibfk_2` ON `novel`(`categoryId`);

-- CreateIndex
CREATE INDEX `novelId` ON `novel_author`(`novelId`);

-- CreateIndex
CREATE INDEX `novelId` ON `novel_tag`(`novelId`);

-- CreateIndex
CREATE INDEX `rating_ibfk_1_idx` ON `rating`(`userId`);

-- CreateIndex
CREATE INDEX `rating_ibfk_2_idx` ON `rating`(`novelId`);

-- CreateIndex
CREATE INDEX `commentId` ON `report`(`commentId`);

-- CreateIndex
CREATE INDEX `report_ibfk_1` ON `report`(`novelId`);

-- CreateIndex
CREATE INDEX `report_ibfk_2` ON `report`(`userId`);

-- CreateIndex
CREATE INDEX `chapterId` ON `view_count`(`chapterId`);

-- CreateIndex
CREATE INDEX `view_count_ibfk_2_idx` ON `view_count`(`userId`);

-- RenameIndex
ALTER TABLE `role_to_permission` RENAME INDEX `role_to_permission_permissionId_fkey` TO `permissionId`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `email`;

-- RenameIndex
ALTER TABLE `user_to_role` RENAME INDEX `user_to_role_roleId_fkey` TO `roleId`;

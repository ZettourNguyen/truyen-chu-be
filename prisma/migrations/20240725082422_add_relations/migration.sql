/*
  Warnings:

  - You are about to drop the `alias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comment_interaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `view_count` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[title]` on the table `novel` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chapterLength` to the `chapter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isPublish` to the `chapter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `notification` table without a default value. This is not possible if the table is not empty.
  - Made the column `state` on table `novel` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `type` to the `report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `chapter` ADD COLUMN `chapterLength` INTEGER UNSIGNED NOT NULL,
    ADD COLUMN `isPublish` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `notification` ADD COLUMN `title` VARCHAR(45) NOT NULL;

-- AlterTable
ALTER TABLE `novel` MODIFY `banner` VARCHAR(255) NULL,
    MODIFY `state` VARCHAR(50) NOT NULL DEFAULT 'ongoing';

-- AlterTable
ALTER TABLE `report` ADD COLUMN `type` VARCHAR(45) NOT NULL,
    MODIFY `content` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `avatar` VARCHAR(255) NULL DEFAULT 'https://staticvn.sangtacvietcdn.xyz/img/useravatar/default.png',
    MODIFY `gender` TINYINT NULL DEFAULT 2;

-- DropTable
DROP TABLE `alias`;

-- DropTable
DROP TABLE `comment_interaction`;

-- DropTable
DROP TABLE `view_count`;

-- CreateTable
CREATE TABLE `rating_interaction` (
    `ratingId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `interactionType` VARCHAR(255) NULL,

    INDEX `userId`(`userId`),
    PRIMARY KEY (`ratingId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `view` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `chapterId` INTEGER NOT NULL,
    `createdAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `view_ibfk_1`(`userId`),
    INDEX `view_ibfk_2`(`chapterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `chapter_index_idx` ON `chapter`(`index`);

-- CreateIndex
CREATE UNIQUE INDEX `title_UNIQUE` ON `novel`(`title`);

-- CreateIndex
CREATE INDEX `idx_tag_name_asc` ON `tag`(`name`);

-- AddForeignKey
ALTER TABLE `bookmark` ADD CONSTRAINT `bookmark_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmark` ADD CONSTRAINT `bookmark_novelId_fkey` FOREIGN KEY (`novelId`) REFERENCES `novel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chapter` ADD CONSTRAINT `chapter_novelId_fkey` FOREIGN KEY (`novelId`) REFERENCES `novel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_novelId_fkey` FOREIGN KEY (`novelId`) REFERENCES `novel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow` ADD CONSTRAINT `follow_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow` ADD CONSTRAINT `follow_novelId_fkey` FOREIGN KEY (`novelId`) REFERENCES `novel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `history` ADD CONSTRAINT `history_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `history` ADD CONSTRAINT `history_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `novel_author` ADD CONSTRAINT `novel_author_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `author`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `novel_author` ADD CONSTRAINT `novel_author_novelId_fkey` FOREIGN KEY (`novelId`) REFERENCES `novel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `novel_tag` ADD CONSTRAINT `novel_tag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `novel_tag` ADD CONSTRAINT `novel_tag_novelId_fkey` FOREIGN KEY (`novelId`) REFERENCES `novel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `novel` ADD CONSTRAINT `novel_posterId_fkey` FOREIGN KEY (`posterId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `novel` ADD CONSTRAINT `novel_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_novelId_fkey` FOREIGN KEY (`novelId`) REFERENCES `novel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_novelId_fkey` FOREIGN KEY (`novelId`) REFERENCES `novel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `comment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `view` ADD CONSTRAINT `view_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `view` ADD CONSTRAINT `view_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `chapter` RENAME INDEX `chapter_ibfk_1` TO `chapter_novelId_fk_idx`;

-- RenameIndex
ALTER TABLE `follow` RENAME INDEX `follow_ibfk_1` TO `fl_fk1_idx`;

-- RenameIndex
ALTER TABLE `follow` RENAME INDEX `follow_ibfk_2` TO `fl_fk2_idx`;

-- RenameIndex
ALTER TABLE `history` RENAME INDEX `chapterId` TO `fk_chapter`;

-- RenameIndex
ALTER TABLE `history` RENAME INDEX `userId` TO `h_c_fk_idx`;

-- RenameIndex
ALTER TABLE `novel_tag` RENAME INDEX `novelId` TO `fk_novel_idx`;

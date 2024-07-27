-- DropForeignKey
ALTER TABLE `view` DROP FOREIGN KEY `view_chapterId_fkey`;

-- DropForeignKey
ALTER TABLE `view` DROP FOREIGN KEY `view_userId_fkey`;

-- AlterTable
ALTER TABLE `history` ADD COLUMN `novelId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `View` ADD CONSTRAINT `View_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `View` ADD CONSTRAINT `View_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `create_at` on the `permission` table. All the data in the column will be lost.
  - You are about to drop the column `permission_name` on the `permission` table. All the data in the column will be lost.
  - You are about to drop the column `role_description` on the `permission` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `permission` table. All the data in the column will be lost.
  - You are about to drop the column `create_at` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `role_description` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `role_name` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `role` table. All the data in the column will be lost.
  - The primary key for the `role_to_permission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `permission_id` on the `role_to_permission` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `role_to_permission` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `role_to_permission` table. All the data in the column will be lost.
  - You are about to drop the column `confirm` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `create_at` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `password` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(250)` to `Char(60)`.
  - The primary key for the `user_to_role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `role_id` on the `user_to_role` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `user_to_role` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `user_to_role` table. All the data in the column will be lost.
  - Added the required column `name` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permissionId` to the `role_to_permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `role_to_permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `user_to_role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `user_to_role` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `permission` DROP COLUMN `create_at`,
    DROP COLUMN `permission_name`,
    DROP COLUMN `role_description`,
    DROP COLUMN `update_at`,
    ADD COLUMN `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `name` VARCHAR(100) NOT NULL,
    ADD COLUMN `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `role` DROP COLUMN `create_at`,
    DROP COLUMN `role_description`,
    DROP COLUMN `role_name`,
    DROP COLUMN `update_at`,
    ADD COLUMN `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `name` VARCHAR(100) NOT NULL,
    ADD COLUMN `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `role_to_permission` DROP PRIMARY KEY,
    DROP COLUMN `permission_id`,
    DROP COLUMN `role_id`,
    DROP COLUMN `update_at`,
    ADD COLUMN `permissionId` INTEGER NOT NULL,
    ADD COLUMN `roleId` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD PRIMARY KEY (`roleId`, `permissionId`);

-- AlterTable
ALTER TABLE `user` DROP COLUMN `confirm`,
    DROP COLUMN `create_at`,
    DROP COLUMN `update_at`,
    ADD COLUMN `confirmed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `username` VARCHAR(100) NOT NULL,
    MODIFY `email` VARCHAR(100) NOT NULL,
    MODIFY `password` CHAR(60) NOT NULL,
    MODIFY `avatar` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `user_to_role` DROP PRIMARY KEY,
    DROP COLUMN `role_id`,
    DROP COLUMN `update_at`,
    DROP COLUMN `user_id`,
    ADD COLUMN `roleId` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `userId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`userId`, `roleId`);

-- AddForeignKey
ALTER TABLE `role_to_permission` ADD CONSTRAINT `role_to_permission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_to_permission` ADD CONSTRAINT `role_to_permission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_to_role` ADD CONSTRAINT `user_to_role_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_to_role` ADD CONSTRAINT `user_to_role_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `email_UNIQUE` TO `User_email_key`;

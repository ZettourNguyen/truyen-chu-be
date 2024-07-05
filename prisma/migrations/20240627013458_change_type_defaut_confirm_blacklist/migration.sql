-- AlterTable
ALTER TABLE `user` MODIFY `confirm` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `blacklist` BOOLEAN NOT NULL DEFAULT false;

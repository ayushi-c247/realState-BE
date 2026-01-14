-- AlterTable
ALTER TABLE `property_list` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `property_specifications` ADD COLUMN `amenities_description` TEXT NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `title` VARCHAR(191) NULL;

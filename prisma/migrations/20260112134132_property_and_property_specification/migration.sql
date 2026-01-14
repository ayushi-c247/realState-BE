/*
  Warnings:

  - You are about to drop the column `agentProfileId` on the `agent_clients` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `agent_clients` DROP FOREIGN KEY `agent_clients_agentProfileId_fkey`;

-- DropIndex
DROP INDEX `agent_clients_agentProfileId_fkey` ON `agent_clients`;

-- AlterTable
ALTER TABLE `agent_clients` DROP COLUMN `agentProfileId`;

-- CreateTable
CREATE TABLE `property_list` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `price` VARCHAR(191) NULL,
    `link` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `scrape_status` ENUM('PROCESSED', 'PENDING') NOT NULL DEFAULT 'PENDING',
    `visibility_status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `property_list_title_key`(`title`),
    INDEX `idx_property_list_scrape_status`(`scrape_status`),
    INDEX `idx_property_list_visibility_status`(`visibility_status`),
    INDEX `idx_property_list_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_specifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `property_id` INTEGER NOT NULL,
    `property_type` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `landmarks` VARCHAR(191) NULL,
    `amenities` VARCHAR(191) NULL,
    `price_min` DOUBLE NULL,
    `price_max` DOUBLE NULL,
    `title_image` VARCHAR(191) NULL,
    `images` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_specifications_property_id`(`property_id`),
    UNIQUE INDEX `uniq_property_id`(`property_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `property_specifications` ADD CONSTRAINT `property_specifications_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `property_list`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

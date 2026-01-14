/*
  Warnings:

  - You are about to drop the column `preferred_regions` on the `investor_profiles` table. All the data in the column will be lost.
  - Added the required column `cities` to the `investor_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `investor_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `investor_profiles` table without a default value. This is not possible if the table is not empty.
  - Made the column `risk_tolerance` on table `investor_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `preferred_property_types` on table `investor_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `investment_horizon` on table `investor_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `primary_objective` on table `investor_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ownership_structure` on table `investor_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `renovation_willingness` on table `investor_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `investor_profiles` DROP COLUMN `preferred_regions`,
    ADD COLUMN `cities` VARCHAR(500) NOT NULL,
    ADD COLUMN `country` VARCHAR(50) NOT NULL,
    ADD COLUMN `state` VARCHAR(50) NOT NULL,
    MODIFY `risk_tolerance` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    MODIFY `preferred_property_types` VARCHAR(191) NOT NULL,
    MODIFY `investment_horizon` ENUM('SHORT', 'MEDIUM', 'LONG') NOT NULL,
    MODIFY `primary_objective` ENUM('YIELD', 'APPRECIATION', 'LIFESTYLE', 'DIVERSIFICATION') NOT NULL,
    MODIFY `ownership_structure` ENUM('SOLE', 'JOINT', 'FRACTIONAL', 'LEASEBACK') NOT NULL,
    MODIFY `tourism_preferences` VARCHAR(255) NULL,
    MODIFY `renovation_willingness` ENUM('TURNKEY', 'LIGHT', 'FULL') NOT NULL,
    MODIFY `amenities_priority` VARCHAR(255) NULL;

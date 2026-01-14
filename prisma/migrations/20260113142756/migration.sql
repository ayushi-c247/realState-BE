/*
  Warnings:

  - Added the required column `budget_unit` to the `investor_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `investor_profiles` ADD COLUMN `budget_unit` ENUM('LAKH', 'CRORE') NOT NULL;

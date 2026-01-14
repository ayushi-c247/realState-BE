-- AlterTable
ALTER TABLE `agent_profiles` MODIFY `approval_status` ENUM('APPROVED', 'PENDING', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `investor_profiles` MODIFY `risk_tolerance` ENUM('LOW', 'HIGH', 'MEDIUM') NOT NULL,
    MODIFY `investment_horizon` ENUM('LONG', 'MEDIUM', 'SHORT') NOT NULL,
    MODIFY `primary_objective` ENUM('APPRECIATION', 'DIVERSIFICATION', 'LIFESTYLE', 'YIELD') NOT NULL,
    MODIFY `ownership_structure` ENUM('FRACTIONAL', 'JOINT', 'LEASEBACK', 'SOLE') NOT NULL,
    MODIFY `renovation_willingness` ENUM('FULL', 'LIGHT', 'TURNKEY') NOT NULL,
    MODIFY `management_strategy` ENUM('AGENCY', 'HYBRID', 'SELF') NULL,
    MODIFY `budget_unit` ENUM('CRORE', 'LAKH') NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('ADMIN', 'AGENT', 'INVESTOR') NOT NULL DEFAULT 'INVESTOR';

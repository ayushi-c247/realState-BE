import {
  UserRole,
  UserStatus,
  PrimaryObjective,
  RenovationWillingness,
  AgentApprovalStatus,
  InvestmentHorizon,
  OwnershipStructure,
  ManagementStrategy,
  RiskTolerance,
  BudgetUnit,
} from "@prisma/client";

export const ALL_ENUMS = [
  ...Object.values(UserRole),
  ...Object.values(UserStatus),
  ...Object.values(PrimaryObjective),
  ...Object.values(InvestmentHorizon),
  ...Object.values(OwnershipStructure),
  ...Object.values(ManagementStrategy),
  ...Object.values(AgentApprovalStatus),
  ...Object.values(RenovationWillingness),
  ...Object.values(RiskTolerance),
  ...Object.values(BudgetUnit),
];

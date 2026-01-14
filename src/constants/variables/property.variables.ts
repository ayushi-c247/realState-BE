import { PropertyListStatus, VisibilityStatus } from "@prisma/client";

export interface PropertyFilters {
  property_type?: string;
  price_min?: number;
  price_max?: number;
  location?: string; // whole address text
  scrape_status?: PropertyListStatus;
  visibility_status?: VisibilityStatus;
}

export type SortType =
  | "PRICE_HIGH_TO_LOW"
  | "PRICE_LOW_TO_HIGH"
  | "NEWEST"
  | "OLDEST";

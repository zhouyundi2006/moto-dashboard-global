export interface Model {
  name: string;
  cc: number;
  type: string;
  price: number | null;
  priceMin: number | null;
  priceMax: number | null;
  priceFrom: boolean;
  priceUnit: string;
  source: string;
  bucket?: string;
  [key: string]: unknown;
}

export interface Logo {
  file: string | null;
  status: "ok" | "missing";
  source: string | null;
  note: string | null;
}

export interface Brand {
  id: string;
  name: string;
  nameEn?: string;
  company?: string;
  category: "Japanese" | "European" | "American" | "Asian other";
  subCategory?: string;
  group?: string;
  marketStatus?: string;
  website?: string;
  logo: Logo;
  logoDark?: boolean;
  models: Model[];
  modelCount: number;
  uncertain?: string[];
  sources?: string[];
  note?: string;
  [key: string]: unknown;
}

export interface Stats {
  brandCount: number;
  brandCountWithModels: number;
  modelCount: number;
  modelCountAll: number;
  parallelBrandCount: number;
  parallelModelCount: number;
  logoCount: number;
  logoMissing: number;
  byCategory: Record<string, number>;
  byCategoryModels: Record<string, number>;
  byBucket: Record<string, number>;
  byType: Record<string, number>;
  [key: string]: unknown;
}

export interface MarketItem {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  note?: string;
}

export interface Market {
  year: number;
  items: MarketItem[];
  leaders250: string[];
  leaders500: string[];
  source: string;
  leadersSource: string;
  [key: string]: unknown;
}

export interface Dashboard {
  meta: Record<string, unknown>;
  stats: Stats;
  market: Market;
  brands: Brand[];
}

export interface SpecRecord {
  [key: string]: unknown;
}

export interface Specs {
  meta: Record<string, unknown>;
  models: Record<string, SpecRecord>;
}

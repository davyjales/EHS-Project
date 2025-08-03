
export type UserType = "industry" | "collector";

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  userType: UserType;
  location?: string;
  description?: string;
  createdAt: Date;
}

export interface WasteItem {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  wasteType: string;
  quantity: number;
  unit: string;
  location: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  wasteItemId: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  quantity: number;
  unit: string;
  price?: number;
  currency?: string;
  status: "pending" | "completed" | "canceled";
  createdAt: Date;
  updatedAt: Date;
  pdfUrl?: string;
}

export type WasteType = 
  | "plastic" 
  | "paper" 
  | "metal" 
  | "glass" 
  | "wood" 
  | "textile" 
  | "electronic" 
  | "organic" 
  | "chemical" 
  | "other";

export const wasteTypeOptions: { value: WasteType; label: string }[] = [
  { value: "plastic", label: "Plástico" },
  { value: "paper", label: "Papel/Papelão" },
  { value: "metal", label: "Metal" },
  { value: "glass", label: "Vidro" },
  { value: "wood", label: "Madeira" },
  { value: "textile", label: "Têxtil" },
  { value: "electronic", label: "Eletrônico" },
  { value: "organic", label: "Orgânico" },
  { value: "chemical", label: "Químico" },
  { value: "other", label: "Outros" },
];

export type UnitType = "kg" | "ton" | "liter" | "m3" | "unit" | "m2";

export const unitTypeOptions: { value: UnitType; label: string }[] = [
  { value: "kg", label: "Quilogramas (kg)" },
  { value: "ton", label: "Toneladas (ton)" },
  { value: "liter", label: "Litros (L)" },
  { value: "m3", label: "Metros cúbicos (m³)" },
  { value: "unit", label: "Unidades" },
  { value: "m2", label: "Metros quadrados (m²)" },
];

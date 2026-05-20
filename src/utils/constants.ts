/**
 * Constantes globales del proyecto
 */

export const CURRENCY_FORMATTER = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export const PRODUCT_CATEGORIES = [
  "Accesorios",
  "Almacenaje",
  "Herramientas eléctricas",
  "Herramientas manuales",
  "Pinturas",
  "Plomería",
];

export const PRODUCT_STATUSES = [
  "Más vendido",
  "Nuevo",
  "Oferta",
  "Clásico",
  "Pro",
  "Stock limitado",
];

export const PAGINATION_SIZE = 9;

export const PRICE_BOUNDS = {
  min: 0,
  max: 200, // Será calculado dinámicamente desde DB
};

// Toast notifications
export const TOAST_DURATION = 3000; // ms
export const TOAST_POSITION = "bottom-right" as const;

// API endpoints
export const API_ENDPOINTS = {
  PRODUCTS: "/api/products",
  ADMIN: "/api/admin",
};

// Supabase tables
export const TABLES = {
  PRODUCTS: "products",
  CATEGORIES: "categories",
  STATUSES: "statuses",
  ADMIN_USERS: "admin_users",
} as const;

// Image upload
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"] as readonly string[],
  BUCKET: "product-images",
} as const;

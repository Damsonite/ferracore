/**
 * Funciones de validación
 */

import { IMAGE_CONFIG } from "./constants";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateProductName(name: string): ValidationError | null {
  if (!name || name.trim().length === 0) {
    return { field: "name", message: "El nombre del producto es requerido" };
  }
  if (name.length < 3) {
    return {
      field: "name",
      message: "El nombre debe tener al menos 3 caracteres",
    };
  }
  if (name.length > 100) {
    return {
      field: "name",
      message: "El nombre no puede exceder 100 caracteres",
    };
  }
  return null;
}

export function validateProductDescription(
  description: string,
): ValidationError | null {
  if (!description || description.trim().length === 0) {
    return { field: "description", message: "La descripción es requerida" };
  }
  if (description.length < 10) {
    return {
      field: "description",
      message: "La descripción debe tener al menos 10 caracteres",
    };
  }
  if (description.length > 500) {
    return {
      field: "description",
      message: "La descripción no puede exceder 500 caracteres",
    };
  }
  return null;
}

export function validatePrice(price: number | string): ValidationError | null {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) {
    return { field: "price", message: "El precio debe ser un número válido" };
  }
  if (numPrice <= 0) {
    return { field: "price", message: "El precio debe ser mayor a 0" };
  }
  if (numPrice > 1000000) {
    return { field: "price", message: "El precio es demasiado alto" };
  }
  return null;
}

export function validateStock(stock: number | string): ValidationError | null {
  const numStock = typeof stock === "string" ? parseInt(stock) : stock;
  if (isNaN(numStock)) {
    return { field: "stock", message: "El stock debe ser un número válido" };
  }
  if (numStock < 0) {
    return { field: "stock", message: "El stock no puede ser negativo" };
  }
  if (numStock > 10000) {
    return { field: "stock", message: "El stock es demasiado alto" };
  }
  return null;
}

export function validateImageFile(file: File): ValidationError | null {
  if (!file) {
    return { field: "image", message: "Selecciona una imagen" };
  }

  if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      field: "image",
      message: "Formato de imagen inválido. Usa JPG, PNG o WebP",
    };
  }

  if (file.size > IMAGE_CONFIG.MAX_SIZE) {
    return {
      field: "image",
      message: `La imagen no debe exceder ${IMAGE_CONFIG.MAX_SIZE / 1024 / 1024}MB`,
    };
  }

  return null;
}

export function validateEmail(email: string): ValidationError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { field: "email", message: "Email inválido" };
  }
  return null;
}

export function validatePassword(password: string): ValidationError | null {
  if (!password || password.length < 8) {
    return {
      field: "password",
      message: "La contraseña debe tener al menos 8 caracteres",
    };
  }
  return null;
}

export function validateProductId(id: string | undefined): boolean {
  if (!id) return false;
  // UUID v4 pattern
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function validateCategoryId(id: string | undefined): boolean {
  if (!id) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{3}-[0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

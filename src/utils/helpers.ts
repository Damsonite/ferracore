/**
 * Funciones auxiliares generales
 */

export function calculatePages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

export function getPageRange(
  currentPage: number,
  totalPages: number,
  window: number = 2,
): (number | string)[] {
  const pages: (number | string)[] = [];

  if (totalPages <= 1) return [1];

  // Primera página
  pages.push(1);

  // Puntos suspensivos
  if (currentPage - window > 2) {
    pages.push("...");
  }

  // Páginas alrededor de la actual
  for (
    let i = Math.max(2, currentPage - window);
    i <= Math.min(totalPages - 1, currentPage + window);
    i++
  ) {
    if (!pages.includes(i)) {
      pages.push(i);
    }
  }

  // Puntos suspensivos
  if (currentPage + window < totalPages - 1) {
    pages.push("...");
  }

  // Última página
  if (totalPages > 1 && !pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return pages;
}

export function getPaginationOffsets(
  page: number,
  pageSize: number,
): { offset: number; limit: number } {
  const offset = (page - 1) * pageSize;
  return { offset, limit: pageSize };
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

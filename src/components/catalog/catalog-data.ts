export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  badge: string;
  description: string;
}

export const productCategories = [
  "Accesorios",
  "Almacenaje",
  "Herramientas eléctricas",
  "Herramientas manuales",
  "Pinturas",
  "Plomería",
];

export const productStatuses = [
  "Más vendido",
  "Nuevo",
  "Oferta",
  "Clásico",
  "Pro",
  "Stock limitado",
];

export const products: Product[] = [
  {
    id: "taladro-percutor-650w",
    name: "Taladro percutor 650W",
    category: "Herramientas eléctricas",
    price: 129.9,
    stock: 18,
    badge: "Más vendido",
    description:
      "Mango ergonómico, velocidad variable y maletín con brocas de prueba.",
  },
  {
    id: "juego-brocas-x25",
    name: "Juego de brocas x25",
    category: "Accesorios",
    price: 24.5,
    stock: 42,
    badge: "Nuevo",
    description:
      "Set mixto para madera, metal y mampostería con estuche compacto.",
  },
  {
    id: "pintura-esmalte-satinado-1l",
    name: "Pintura esmalte satinado 1L",
    category: "Pinturas",
    price: 18.75,
    stock: 31,
    badge: "Oferta",
    description:
      "Acabado resistente para interior y exterior con alto rendimiento.",
  },
  {
    id: "martillo-de-una-16-oz",
    name: "Martillo de uña 16 oz",
    category: "Herramientas manuales",
    price: 16.2,
    stock: 55,
    badge: "Clásico",
    description:
      "Cabeza forjada y mango antideslizante para trabajo diario en obra.",
  },
  {
    id: "llave-ajustable-10",
    name: 'Llave ajustable 10"',
    category: "Plomería",
    price: 22.9,
    stock: 26,
    badge: "Pro",
    description: "Apertura amplia, ajuste suave y acabado anticorrosivo.",
  },
  {
    id: "caja-de-herramientas-20",
    name: 'Caja de herramientas 20"',
    category: "Almacenaje",
    price: 34.9,
    stock: 14,
    badge: "Stock limitado",
    description:
      "Bandeja removible, cierres reforzados y espacio para consumibles.",
  },
];

export const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export const priceBounds = {
  min: 0,
  max: Math.ceil(Math.max(...products.map((product) => product.price), 0)),
};

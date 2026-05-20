import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/database.types";
import { IMAGE_CONFIG } from "@/utils/constants";
import { formatPrice, slugify } from "@/utils/formatters";

export type AdminCategory = Pick<Tables<"categories">, "id" | "name" | "slug">;
export type AdminStatus = Pick<
  Tables<"product_statuses">,
  "id" | "name" | "slug"
>;

export type AdminProduct = Tables<"products"> & {
  category?: AdminCategory | null;
  status?: AdminStatus | null;
};

export interface AdminCatalogState {
  products: AdminProduct[];
  categories: AdminCategory[];
  statuses: AdminStatus[];
}

export interface ProductDraft {
  id?: number | null;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  statusId: string;
  active: boolean;
  imageFile?: File | null;
  existingImageUrl?: string | null;
}

export function createAdminClient(
  url: string,
  key: string,
): SupabaseClient<Database> {
  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });
}

export async function getCurrentSession(client: SupabaseClient<Database>) {
  const { data, error } = await client.auth.getSession();

  if (error || !data.session) {
    return null;
  }

  return data.session;
}

export async function fetchAdminCatalog(
  client: SupabaseClient<Database>,
): Promise<AdminCatalogState> {
  const [productsResult, categoriesResult, statusesResult] = await Promise.all([
    client
      .from("products")
      .select(
        `
        *,
        category:category_id (id, name, slug),
        status:status_id (id, name, slug)
      `,
      )
      .order("created_at", { ascending: false }),
    client
      .from("categories")
      .select("id, name, slug")
      .order("name", { ascending: true }),
    client
      .from("product_statuses")
      .select("id, name, slug")
      .order("name", { ascending: true }),
  ]);

  if (productsResult.error) {
    throw new Error(
      `No se pudieron cargar los productos: ${productsResult.error.message}`,
    );
  }

  if (categoriesResult.error) {
    throw new Error(
      `No se pudieron cargar las categorías: ${categoriesResult.error.message}`,
    );
  }

  if (statusesResult.error) {
    throw new Error(
      `No se pudieron cargar los estados: ${statusesResult.error.message}`,
    );
  }

  return {
    products: (productsResult.data ?? []) as AdminProduct[],
    categories: (categoriesResult.data ?? []) as AdminCategory[],
    statuses: (statusesResult.data ?? []) as AdminStatus[],
  };
}

export async function saveProduct(
  client: SupabaseClient<Database>,
  draft: ProductDraft,
): Promise<AdminProduct> {
  const imageUrl = draft.imageFile
    ? (await uploadProductImage(client, draft.name, draft.imageFile)).url
    : (draft.existingImageUrl ?? null);

  const payload = {
    active: draft.active,
    category_id: draft.categoryId,
    description: draft.description.trim(),
    image_url: imageUrl,
    name: draft.name.trim(),
    price: draft.price,
    slug: slugify(draft.name),
    status_id: draft.statusId,
    stock: draft.stock,
    update_at: new Date().toISOString(),
  };

  if (draft.id) {
    const { data, error } = await client
      .from("products")
      .update(payload)
      .eq("id", draft.id)
      .select(
        `
        *,
        category:category_id (id, name, slug),
        status:status_id (id, name, slug)
      `,
      )
      .single();

    if (error || !data) {
      throw new Error(
        `No se pudo actualizar el producto: ${error?.message ?? "error desconocido"}`,
      );
    }

    if (draft.imageFile && draft.existingImageUrl) {
      await deleteImageByUrl(client, draft.existingImageUrl);
    }

    return data as AdminProduct;
  }

  const { data, error } = await client
    .from("products")
    .insert(payload)
    .select(
      `
      *,
      category:category_id (id, name, slug),
      status:status_id (id, name, slug)
    `,
    )
    .single();

  if (error || !data) {
    throw new Error(
      `No se pudo crear el producto: ${error?.message ?? "error desconocido"}`,
    );
  }

  return data as AdminProduct;
}

export async function removeProduct(
  client: SupabaseClient<Database>,
  product: AdminProduct,
): Promise<void> {
  if (product.image_url) {
    await deleteImageByUrl(client, product.image_url);
  }

  const { error } = await client.from("products").delete().eq("id", product.id);

  if (error) {
    throw new Error(`No se pudo eliminar el producto: ${error.message}`);
  }
}

export function formatAdminPrice(value: number): string {
  return formatPrice(value);
}

export function extractStoragePath(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${IMAGE_CONFIG.BUCKET}/`;
    const pathIndex = url.pathname.indexOf(marker);

    if (pathIndex === -1) {
      return null;
    }

    return url.pathname.slice(pathIndex + marker.length);
  } catch {
    return null;
  }
}

async function uploadProductImage(
  client: SupabaseClient<Database>,
  productName: string,
  file: File,
): Promise<{ path: string; url: string }> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const fileName = `${slugify(productName) || "product"}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension}`;
  const path = `products/${fileName}`;

  const { error } = await client.storage
    .from(IMAGE_CONFIG.BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`No se pudo subir la imagen: ${error.message}`);
  }

  const { data } = client.storage.from(IMAGE_CONFIG.BUCKET).getPublicUrl(path);

  return {
    path,
    url: data.publicUrl,
  };
}

async function deleteImageByUrl(
  client: SupabaseClient<Database>,
  imageUrl: string,
): Promise<void> {
  const path = extractStoragePath(imageUrl);

  if (!path) {
    return;
  }

  const { error } = await client.storage
    .from(IMAGE_CONFIG.BUCKET)
    .remove([path]);

  if (error) {
    console.warn(`No se pudo eliminar la imagen: ${error.message}`);
  }
}

/**
 * Helpers for Supabase Storage operations
 */

import { IMAGE_CONFIG } from "@/utils/constants";
import { supabase } from "./supabase";

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
): Promise<{ path: string; url: string }> {
  // Validate file
  if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type");
  }

  if (file.size > IMAGE_CONFIG.MAX_SIZE) {
    throw new Error("File size exceeds limit");
  }

  // Upload
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    path: data.path,
    url: urlData.publicUrl,
  };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.warn(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * List files in a bucket/path
 */
export async function listFiles(
  bucket: string,
  path: string,
): Promise<string[]> {
  const { data, error } = await supabase.storage.from(bucket).list(path);

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }

  return (data || []).map((file) => file.name);
}

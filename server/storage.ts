// Storage helpers using Supabase Storage
// Replaces the legacy Manus Forge API storage proxy

import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

const supabase = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey);

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const bucket = "risegrind-files";

  // Convert data to Buffer if needed
  let buffer: Buffer;
  if (typeof data === "string") {
    buffer = Buffer.from(data, "utf-8");
  } else if (data instanceof Uint8Array) {
    buffer = Buffer.from(data);
  } else {
    buffer = data;
  }

  // Upload to Supabase Storage
  const { data: uploadData, error } = await supabase.storage
    .from(bucket)
    .upload(key, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(key);

  return {
    key,
    url: publicUrlData.publicUrl,
  };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const bucket = "risegrind-files";

  // Get public URL from Supabase Storage
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(key);

  return {
    key,
    url: publicUrlData.publicUrl,
  };
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

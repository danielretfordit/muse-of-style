import { supabase } from "@/integrations/supabase/client";

/**
 * Get a signed URL for a private storage file.
 * This is needed because the wardrobe bucket is private for user privacy.
 * 
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param expiresIn - URL expiration in seconds (default: 1 hour)
 * @returns The signed URL or null if error
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error in getSignedUrl:", error);
    return null;
  }
}

/**
 * Extract file path from a storage URL.
 * Works with both public URLs and full paths.
 * 
 * @param url - The full URL or path
 * @param bucket - The bucket name to extract from
 * @returns The file path within the bucket
 */
export function extractStoragePath(url: string, bucket: string): string | null {
  if (!url) return null;
  
  // If it's already just a path (user-id/filename.jpg), return it
  if (!url.startsWith("http")) {
    return url;
  }
  
  // Extract path from Supabase storage URL
  // Format: https://xxx.supabase.co/storage/v1/object/public/bucket/path
  const bucketPattern = new RegExp(`/storage/v1/object/(?:public|sign)/${bucket}/(.+)$`);
  const match = url.match(bucketPattern);
  
  if (match) {
    return decodeURIComponent(match[1]);
  }
  
  return null;
}

/**
 * Get signed URLs for multiple files in batch.
 * More efficient than calling getSignedUrl multiple times.
 * 
 * @param bucket - The storage bucket name
 * @param paths - Array of file paths
 * @param expiresIn - URL expiration in seconds
 * @returns Map of path to signed URL
 */
export async function getSignedUrls(
  bucket: string,
  paths: string[],
  expiresIn: number = 3600
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  
  // Supabase supports batch signed URLs
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, expiresIn);

  if (error || !data) {
    console.error("Error creating signed URLs:", error);
    return urlMap;
  }

  data.forEach((item) => {
    if (item.signedUrl && item.path) {
      urlMap.set(item.path, item.signedUrl);
    }
  });

  return urlMap;
}

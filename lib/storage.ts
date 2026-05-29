import { supabase } from './supabase';

// ─── CONFIGURATION & CONSTRAINTS ──────────────────────────────────────────────
const DEFAULT_PUBLIC_BUCKET = 'user-uploads';
const DEFAULT_PRIVATE_BUCKET = 'private-documents';

// Max file sizes (in bytes)
const PUBLIC_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB
const PRIVATE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB

// Approved mime-types matching database storage policy
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'text/csv',
  'application/json',
  'text/plain',
  'application/octet-stream'
];

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// ─── UTILITY HELPERS ──────────────────────────────────────────────────────────

// Safely resolve the active user's Supabase UUID
async function getSupabaseUserId(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    const sessionStr = localStorage.getItem('supabaseSession');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session?.user?.id) return session.user.id;
      } catch (e) {}
    }
  }
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) return session.user.id;
  } catch (e) {}
  return null;
}

// Helper to execute operations with exponential backoff retries
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

// Convert a base64 data string to a raw Blob for upload
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64.split(',')[1] || base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

// ─── STORAGE SERVICE DEFINITION ──────────────────────────────────────────────
export const storageService = {
  /**
   * Upload a standard File object to Supabase Storage with full validations and catalog syncing
   */
  async uploadFile(
    file: File,
    options?: { bucket?: string; isPublic?: boolean; customPath?: string }
  ): Promise<UploadResult> {
    const isPublic = options?.isPublic !== false;
    const bucket = options?.bucket || (isPublic ? DEFAULT_PUBLIC_BUCKET : DEFAULT_PRIVATE_BUCKET);
    const sizeLimit = isPublic ? PUBLIC_SIZE_LIMIT : PRIVATE_SIZE_LIMIT;

    // 1. Validation - File Size Check
    if (file.size > sizeLimit) {
      throw new Error(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum limit allowed (${(
          sizeLimit /
          (1024 * 1024)
        ).toFixed(0)}MB)`
      );
    }

    // 2. Validation - File Type Check
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Please upload an approved format.`);
    }

    // 3. Generate randomized, collision-resistant path
    const fileExt = file.name.split('.').pop() || '';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const randomizedPath = options?.customPath || `${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${cleanFileName}.${fileExt}`;

    try {
      // 4. Perform upload with retry logic
      const uploadFn = async () => {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(randomizedPath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw new Error(error.message);
        return data;
      };

      const uploadResult = await retryWithBackoff(uploadFn);
      
      // 5. Generate appropriate Access URL
      let finalUrl = '';
      if (isPublic) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(uploadResult.path);
        finalUrl = data.publicUrl;
      } else {
        // Private assets generate single-use signed URLs
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(uploadResult.path, 3600); // Valid for 1 hour
        if (error) throw error;
        finalUrl = data.signedUrl;
      }

      // 6. Write relational catalog reference to public.uploads table
      const sbUserId = await getSupabaseUserId();
      if (sbUserId) {
        try {
          const { error: dbError } = await supabase
            .from('uploads')
            .insert({
              user_id: sbUserId,
              file_name: file.name,
              file_size: file.size,
              mime_type: file.type,
              asset_url: finalUrl
            });
          
          if (dbError) {
            console.warn('[Storage Catalog Warning] Upload tracked but metadata insert failed:', dbError.message);
          }
        } catch (dbErr) {
          console.warn('[Storage Catalog Error] Upload metadata cataloging skipped:', dbErr);
        }
      }

      return {
        url: finalUrl,
        path: uploadResult.path,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      };
    } catch (err: any) {
      console.error('[Supabase Storage Exception] Failed to execute upload:', err);
      throw new Error(`Upload failed: ${err.message || err}`);
    }
  },

  /**
   * Upload a base64 encoded string directly to Supabase Storage
   */
  async uploadBase64(
    base64Str: string,
    fileName: string,
    mimeType: string,
    options?: { bucket?: string; isPublic?: boolean }
  ): Promise<UploadResult> {
    try {
      const blob = base64ToBlob(base64Str, mimeType);
      const file = new File([blob], fileName, { type: mimeType });
      return await this.uploadFile(file, options);
    } catch (err: any) {
      console.error('[Supabase Storage Base64 Exception] Processing failed:', err);
      throw err;
    }
  },

  /**
   * Retrieve single-use signed URL for private bucket objects
   */
  async getPrivateUrl(path: string, expiresIn = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(DEFAULT_PRIVATE_BUCKET)
        .createSignedUrl(path, expiresIn);
      
      if (error) throw error;
      return data.signedUrl;
    } catch (err: any) {
      console.error('[Supabase Storage Access Exception] Failed to sign URL:', err);
      throw err;
    }
  },

  /**
   * Delete an object from a Supabase Storage bucket
   */
  async deleteFile(path: string, bucket = DEFAULT_PUBLIC_BUCKET): Promise<void> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) throw error;
      
      // Attempt to clear from database catalog
      try {
        const { error: dbError } = await supabase
          .from('uploads')
          .delete()
          .ilike('asset_url', `%${path}%`);
        if (dbError) console.warn('[Storage Catalog Warning] Failed to delete metadata record:', dbError.message);
      } catch (dbErr) {}
    } catch (err: any) {
      console.error('[Supabase Storage Purge Exception] File deletion failed:', err);
      throw err;
    }
  },

  /**
   * Query all cataloged file references uploaded by the authenticated user
   */
  async getUserUploads(): Promise<any[]> {
    const sbUserId = await getSupabaseUserId();
    if (!sbUserId) return [];

    try {
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('user_id', sbUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[Storage Catalog Query Exception] Failed to retrieve uploads:', err);
      return [];
    }
  }
};

export default storageService;

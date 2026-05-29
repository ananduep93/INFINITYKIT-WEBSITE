-- ====================================================================
-- INFINITY KIT SUPABASE STORAGE PRODUCTION-READY MIGRATION SCHEMA
-- ====================================================================
-- Description: Establishes secure storage buckets and structures.
-- Creates public ('user-uploads') and private ('private-documents')
-- buckets and configures robust Row Level Security (RLS) policies.
-- ====================================================================

-- ─── 1. BUCKET INITIALIZATION ──────────────────────────────────────

-- Insert public uploads bucket (for images, avatars, prompts, etc.)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-uploads', 
  'user-uploads', 
  true, 
  10485760, -- 10MB limit
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf', 'text/csv', 'application/json', 'text/plain']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf', 'text/csv', 'application/json', 'text/plain'];

-- Insert private documents bucket (for sensitive logs, encrypted backups)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'private-documents', 
  'private-documents', 
  false, 
  52428800, -- 50MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/csv', 'application/json', 'text/plain', 'application/octet-stream']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/csv', 'application/json', 'text/plain', 'application/octet-stream'];

-- ─── 2. ROW LEVEL SECURITY (RLS) ON STORAGE.OBJECTS ─────────────────

-- Drop existing policies to prevent conflicts
drop policy if exists "Allow public read access on user-uploads bucket" on storage.objects;
drop policy if exists "Allow authenticated users to upload to user-uploads bucket" on storage.objects;
drop policy if exists "Allow users to delete their own uploads in user-uploads" on storage.objects;
drop policy if exists "Allow users to read their own private documents" on storage.objects;
drop policy if exists "Allow users to upload private documents" on storage.objects;
drop policy if exists "Allow users to update/delete their own private documents" on storage.objects;
drop policy if exists "Allow admins full access to storage objects" on storage.objects;

-- ─── 3. PUBLIC UPLOADS POLICIES ─────────────────────────────────────

-- Policy A: Anyone can view objects in the public bucket
create policy "Allow public read access on user-uploads bucket"
  on storage.objects for select
  using ( bucket_id = 'user-uploads' );

-- Policy B: Authenticated users can insert/upload files into the public bucket
create policy "Allow authenticated users to upload to user-uploads bucket"
  on storage.objects for insert
  with check (
    bucket_id = 'user-uploads' 
    and auth.role() = 'authenticated'
  );

-- Policy C: Users can delete or update their own uploaded files in the public bucket
create policy "Allow users to delete their own uploads in user-uploads"
  on storage.objects for all
  using (
    bucket_id = 'user-uploads'
    and auth.uid() = owner
  );

-- ─── 4. PRIVATE UPLOADS POLICIES ────────────────────────────────────

-- Policy D: Users can read only their own private documents
create policy "Allow users to read their own private documents"
  on storage.objects for select
  using (
    bucket_id = 'private-documents'
    and auth.uid() = owner
  );

-- Policy E: Authenticated users can upload private documents under their ownership
create policy "Allow users to upload private documents"
  on storage.objects for insert
  with check (
    bucket_id = 'private-documents'
    and auth.role() = 'authenticated'
    and auth.uid() = owner
  );

-- Policy F: Users can modify or purge their own private documents
create policy "Allow users to update/delete their own private documents"
  on storage.objects for all
  using (
    bucket_id = 'private-documents'
    and auth.uid() = owner
  );

-- ─── 5. GLOBAL ADMIN POLICY OVERRIDE ────────────────────────────────

-- Policy G: Admins (verified in public.profiles) have complete read/write override
create policy "Allow admins full access to storage objects"
  on storage.objects for all
  using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

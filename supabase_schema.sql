-- ====================================================================
-- INFINITY KIT PRODUCTION-READY SUPABASE POSTGRESQL MIGRATION SCHEMA
-- ====================================================================
-- Description: Converts Firebase Firestore collections to PostgreSQL.
-- Preserves NoSQL JSONB flexibility where needed for local-first sync,
-- while establishing robust relational keys, indexes, and RLS policies.
-- ====================================================================

-- Enable UUID generation extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. USERS & PROFILES CONFIGURATION
-- ==========================================

-- User Profiles Table (Linked directly to Supabase Auth system)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text,
  photo_url text,
  last_login timestamp with time zone default timezone('utc'::text, now()) not null,
  role text default 'user'::text check (role in ('user', 'admin')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- RLS Policies for Profiles
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profiles" on public.profiles
  for update using (auth.uid() = id);

-- Trigger: Automatically create public profile entry on Supabase Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, photo_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', 'User'),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    case 
      when new.email in ('admin@infinitykit.com', 'ananduep93@gmail.com') then 'admin'
      else 'user'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 2. USER-SPECIFIC CONFIGURATIONS & SETTINGS
-- ==========================================

-- User Settings (Theme preferences, cased configurations, local settings syncs)
create table public.user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  theme text default 'dark'::text not null,
  api_keys jsonb default '{}'::jsonb not null, -- Stores user custom OpenAI/Gemini keys privately
  language_units text default 'en'::text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_settings enable row level security;

create policy "Users can manage their own settings" on public.user_settings
  for all using (auth.uid() = user_id);

-- ==========================================
-- 3. LOCAL-FIRST TOOL SANDBOXES (JSONB BACKUPS)
-- ==========================================

-- Unified Sandbox Backups (Notes, Todos, Budget lists, medication schedules)
-- Matches lib/sync.ts PATH_MAP casing schema directly!
create table public.user_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tool_name text not null, -- Mapped cased identifiers (e.g. 'notes', 'todos', 'expenses', 'passwords')
  data jsonb not null, -- Unstructured payload backed up from localStorage
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, tool_name)
);

-- Optimize GIN Indexing for high-speed search inside JSONB documents
create index idx_user_data_tool on public.user_data(user_id, tool_name);
create index idx_user_data_jsonb_gin on public.user_data using gin (data);

alter table public.user_data enable row level security;

create policy "Users can manage their own local sync backups" on public.user_data
  for all using (auth.uid() = user_id);

-- ==========================================
-- 4. SAVED TOOLS, BOOKMARKS & LOGS
-- ==========================================

-- Saved Tools (Favorites / Bookmarks list)
create table public.user_favorites (
  user_id uuid references public.profiles(id) on delete cascade not null,
  tool_id text not null, -- Cased path identifiers (e.g. 'bmicalculator', 'dead-drop-note')
  saved_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, tool_id)
);

alter table public.user_favorites enable row level security;

create policy "Users can manage their own favorites list" on public.user_favorites
  for all using (auth.uid() = user_id);

-- Tool Usage History logs (recent accessed logs)
create table public.tool_usage (
  user_id uuid references public.profiles(id) on delete cascade not null,
  tool_id text not null,
  last_accessed timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, tool_id)
);

create index idx_tool_usage_accessed on public.tool_usage(user_id, last_accessed desc);

alter table public.tool_usage enable row level security;

create policy "Users can manage their own tool usage history" on public.tool_usage
  for all using (auth.uid() = user_id);

-- ==========================================
-- 5. AI CONVERSATIONS & PROMPTS
-- ==========================================

-- AI Chat & Generator Transcript History (ai_history)
create table public.ai_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tool text not null, -- chatbot, code-explainer, translator, image-generator etc.
  input text not null,
  output text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_ai_history_user_time on public.ai_history(user_id, created_at desc);

alter table public.ai_history enable row level security;

create policy "Users can manage their own AI logs history" on public.ai_history
  for all using (auth.uid() = user_id);

-- Admin Uploaded AI Prompts Gallery (aiPrompts)
create table public.ai_prompts (
  id serial primary key,
  category text check (category in ('men', 'women')) not null,
  image_url text not null, -- Stores High-density Base64 image data strings
  prompt text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ai_prompts enable row level security;

create policy "Anyone can read AI prompts gallery" on public.ai_prompts
  for select using (true);

create policy "Admins can manage AI prompts gallery" on public.ai_prompts
  for all using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ==========================================
-- 6. DYNAMIC SURVEY HUBS (SURVEY HUB)
-- ==========================================

-- Surveys Built (surveyHub templates)
create table public.surveys (
  id text primary key, -- Custom short codes generated by Frontend builder
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  questions jsonb not null, -- Stores array of question blocks (id, text, type, options)
  theme text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.surveys enable row level security;

create policy "Anyone can access surveys templates" on public.surveys
  for select using (true);

create policy "Creators can manage their own surveys" on public.surveys
  for all using (auth.uid() = user_id);

-- Survey Submissions (surveyResponses)
create table public.survey_responses (
  id text primary key, -- Randomly generated codes for submissions
  survey_id text references public.surveys(id) on delete cascade not null,
  answers jsonb not null, -- Stores submitted fields (questionId -> value mapping)
  browser text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_survey_responses_parent on public.survey_responses(survey_id);

alter table public.survey_responses enable row level security;

create policy "Anyone can submit response answers" on public.survey_responses
  for insert with check (true);

create policy "Creators and Admins can analyze response answers" on public.survey_responses
  for select using (
    exists (
      select 1 from public.surveys s 
      where s.id = survey_id and (s.user_id = auth.uid() or exists (
        select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
      ))
    )
  );

create policy "Creators and Admins can delete response answers" on public.survey_responses
  for delete using (
    exists (
      select 1 from public.surveys s 
      where s.id = survey_id and (s.user_id = auth.uid() or exists (
        select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
      ))
    )
  );

-- ==========================================
-- 7. SYSTEM STATUS, ADS & REVIEWS
-- ==========================================

-- System Changelogs (updates)
create table public.system_updates (
  id serial primary key,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.system_updates enable row level security;

create policy "Anyone can read system updates" on public.system_updates
  for select using (true);

create policy "Admins can manage system updates" on public.system_updates
  for all using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Affiliate Ads Catalog (affiliateAds)
create table public.affiliate_ads (
  id serial primary key,
  title text not null,
  affiliate_link text not null,
  media_link text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.affiliate_ads enable row level security;

create policy "Anyone can view affiliate advertisements" on public.affiliate_ads
  for select using (true);

create policy "Admins can manage affiliate advertisements" on public.affiliate_ads
  for all using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Customer Testimonials & Reviews (reviews)
create table public.reviews (
  id serial primary key,
  name text not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

create policy "Anyone can view customer reviews" on public.reviews
  for select using (true);

create policy "Anyone can post customer reviews" on public.reviews
  for insert with check (true);

create policy "Admins can update customer reviews" on public.reviews
  for update using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can delete customer reviews" on public.reviews
  for delete using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() and p.role = 'admin'
    )
  );


-- ==========================================
-- 8. PREMIUM SUBSCRIPTIONS, NOTIFICATIONS & AUDITING
-- ==========================================

-- Subscriptions Table
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  status text check (status in ('active', 'canceled', 'past_due', 'trialing', 'inactive')) not null,
  pricing_tier text default 'free'::text not null, -- free, premium_monthly, premium_yearly
  current_period_end timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscription status" on public.subscriptions
  for select using (auth.uid() = user_id);

-- System Notifications Table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'info'::text check (type in ('info', 'success', 'warning', 'error')) not null,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_notifications_unread on public.notifications(user_id, is_read) where is_read = false;

alter table public.notifications enable row level security;

create policy "Users can manage their own notifications alerts" on public.notifications
  for all using (auth.uid() = user_id);

-- Admin Audit Operations Log
create table public.admin_logs (
  id serial primary key,
  admin_id uuid references public.profiles(id) on delete set null,
  action_type text not null, -- POST_UPDATE, ADD_PRODUCT, UPLOAD_PROMPT, DELETE_REVIEW
  details text not null,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admin_logs enable row level security;

create policy "Admins can view operational audit logs" on public.admin_logs
  for select using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- General Media Uploads Tracking
create table public.uploads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  file_name text not null,
  file_size integer not null,
  mime_type text not null,
  asset_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.uploads enable row level security;

create policy "Users can view their own file upload references" on public.uploads
  for select using (auth.uid() = user_id);

-- ==========================================
-- 9. DYNAMIC GLOBAL ADMIN SECURITY CLAUSE
-- ==========================================

-- Global Override allowing verified Admins full bypass access to all public schema tables
create policy "Admins full override permissions" on public.user_data for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins full override favorites" on public.user_favorites for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins full override usage" on public.tool_usage for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins full override settings" on public.user_settings for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins full override ai history" on public.ai_history for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins full override notifications" on public.notifications for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins full override uploads" on public.uploads for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins full override subscriptions" on public.subscriptions for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

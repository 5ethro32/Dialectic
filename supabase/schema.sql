-- ============================================================
-- DIALECTIC — Full Database Schema
-- ============================================================

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) primary key,
  display_name text not null,
  avatar_url text,
  encrypted_api_key text,
  theme_preference text default 'system' check (theme_preference in ('light', 'dark', 'system')),
  created_at timestamptz default now()
);

-- ============================================================
-- CASES
-- ============================================================
create table if not exists public.cases (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  mode text default 'adversarial' check (mode in (
    'adversarial',
    'inquiry',
    'challenge'
  )),
  status text default 'draft' check (status in (
    'draft',
    'consulting',
    'submitted',
    'deliberating',
    'verdict',
    'reopened'
  )),
  created_by uuid references public.profiles(id) not null,
  opponent_id uuid references public.profiles(id),
  invite_code text unique default encode(gen_random_bytes(8), 'hex'),
  deadline timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- POSITIONS
-- ============================================================
create table if not exists public.positions (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  label text not null,
  side text check (side in ('for', 'against', 'exploring')),
  created_at timestamptz default now(),
  unique(case_id, user_id)
);

-- ============================================================
-- COUNSEL MESSAGES
-- ============================================================
create table if not exists public.counsel_messages (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  role text check (role in ('user', 'counsel')) not null,
  content text not null,
  message_type text default 'text' check (message_type in (
    'text',
    'research_card',
    'confidence_update',
    'brief_update',
    'system'
  )),
  metadata jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- RESEARCH
-- ============================================================
create table if not exists public.research (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  query text,
  source_url text,
  source_title text,
  summary text not null,
  relevance_score numeric(3,2),
  approved_by_user boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- BRIEFS
-- ============================================================
create table if not exists public.briefs (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  opening_statement text,
  key_arguments jsonb,
  evidence_summary jsonb,
  preemptive_rebuttals text,
  closing_statement text,
  confidence_score numeric(3,1),
  confidence_breakdown jsonb,
  completeness jsonb,
  status text default 'draft' check (status in ('draft', 'submitted')),
  submitted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(case_id, user_id)
);

-- ============================================================
-- VERDICTS
-- ============================================================
create table if not exists public.verdicts (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  majority_summary text,
  synthesis text,
  winning_side text,
  winning_margin text,
  dissenting_opinions jsonb,
  unresolved_questions jsonb,
  recommendations jsonb,
  raw_responses jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- JUDGE OPINIONS
-- ============================================================
create table if not exists public.judge_opinions (
  id uuid default gen_random_uuid() primary key,
  verdict_id uuid references public.verdicts(id) on delete cascade not null,
  judge_key text not null check (judge_key in (
    'empiricist', 'logician', 'contrarian', 'pragmatist', 'chief_justice'
  )),
  judge_display_name text not null,
  judge_title text not null,
  verdict_for text check (verdict_for in ('for', 'against', 'abstain')),
  reasoning text not null,
  score_participant_a jsonb,
  score_participant_b jsonb,
  notable_moments jsonb,
  created_at timestamptz default now(),
  unique(verdict_id, judge_key)
);

-- ============================================================
-- JOURNAL NOTES
-- ============================================================
create table if not exists public.journal_notes (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_cases_created_by on public.cases(created_by);
create index if not exists idx_cases_opponent on public.cases(opponent_id);
create index if not exists idx_cases_invite on public.cases(invite_code);
create index if not exists idx_counsel_case_user on public.counsel_messages(case_id, user_id);
create index if not exists idx_research_case_user on public.research(case_id, user_id);
create index if not exists idx_briefs_case on public.briefs(case_id);
create index if not exists idx_verdicts_case on public.verdicts(case_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Cases
alter table public.cases enable row level security;
create policy "Participants can view their cases" on public.cases for select
  using (auth.uid() = created_by or auth.uid() = opponent_id);
create policy "Authenticated users can create cases" on public.cases for insert
  with check (auth.uid() = created_by);
create policy "Participants can update their cases" on public.cases for update
  using (auth.uid() = created_by or auth.uid() = opponent_id);

-- Positions
alter table public.positions enable row level security;
create policy "Participants can view positions" on public.positions for select
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_id
      and (c.created_by = auth.uid() or c.opponent_id = auth.uid())
    )
  );
create policy "Participants can insert positions" on public.positions for insert
  with check (auth.uid() = user_id);

-- Counsel messages — PRIVATE
alter table public.counsel_messages enable row level security;
create policy "Users can only see their own counsel messages" on public.counsel_messages for select
  using (auth.uid() = user_id);
create policy "Users can insert their own counsel messages" on public.counsel_messages for insert
  with check (auth.uid() = user_id);

-- Research — private
alter table public.research enable row level security;
create policy "Users can only see their own research" on public.research for select
  using (auth.uid() = user_id);
create policy "Users can insert their own research" on public.research for insert
  with check (auth.uid() = user_id);
create policy "Users can update their own research" on public.research for update
  using (auth.uid() = user_id);

-- Briefs
alter table public.briefs enable row level security;
create policy "Users can see own brief always" on public.briefs for select
  using (auth.uid() = user_id);
create policy "Participants can see opponent brief after both submitted" on public.briefs for select
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_id
      and (c.created_by = auth.uid() or c.opponent_id = auth.uid())
      and c.status in ('submitted', 'deliberating', 'verdict', 'reopened')
    )
  );
create policy "Users can insert own brief" on public.briefs for insert
  with check (auth.uid() = user_id);
create policy "Users can update own draft brief" on public.briefs for update
  using (auth.uid() = user_id and status = 'draft');

-- Verdicts
alter table public.verdicts enable row level security;
create policy "Participants can view verdicts" on public.verdicts for select
  using (
    exists (
      select 1 from public.cases c
      where c.id = case_id
      and (c.created_by = auth.uid() or c.opponent_id = auth.uid())
    )
  );

-- Judge opinions
alter table public.judge_opinions enable row level security;
create policy "Participants can view judge opinions" on public.judge_opinions for select
  using (
    exists (
      select 1 from public.verdicts v
      join public.cases c on c.id = v.case_id
      where v.id = verdict_id
      and (c.created_by = auth.uid() or c.opponent_id = auth.uid())
    )
  );

-- Journal
alter table public.journal_notes enable row level security;
create policy "Users can only see own journal" on public.journal_notes for select
  using (auth.uid() = user_id);
create policy "Users can insert own journal notes" on public.journal_notes for insert
  with check (auth.uid() = user_id);

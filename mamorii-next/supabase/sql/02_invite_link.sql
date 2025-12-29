-- 招待・紐付け（idempotent / 何度流しても壊れにくい）

-- 招待コード生成に必要
create extension if not exists pgcrypto;

-- 1) 招待コードテーブル（無ければ作る）
create table if not exists public.invites (
  code text primary key default encode(gen_random_bytes(16), 'hex'),
  senior_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_by_family_id uuid references auth.users(id) on delete set null,
  used_at timestamptz
);

-- 2) 家族 ↔ 高齢者 の紐付けテーブル（無ければ作る）
create table if not exists public.family_seniors (
  family_id uuid not null references auth.users(id) on delete cascade,
  senior_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (family_id, senior_id)
);

-- 3) RLS
alter table public.invites enable row level security;
alter table public.family_seniors enable row level security;

-- invites: 自分（高齢者）が自分の招待を作成/閲覧できる
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='invites' and policyname='invites_select_own_senior'
  ) then
    create policy "invites_select_own_senior"
      on public.invites for select
      to authenticated
      using (senior_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='invites' and policyname='invites_insert_own_senior'
  ) then
    create policy "invites_insert_own_senior"
      on public.invites for insert
      to authenticated
      with check (senior_id = auth.uid());
  end if;
end $$;

-- 4) 招待コード利用を“原子的に”行う関数（安全に紐付けして使用済みにする）
create or replace function public.use_invite(p_code text)
returns table (senior_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_senior uuid;
begin
  -- codeが有効か（未使用 & 期限内）を確認してロック
  select i.senior_id into v_senior
  from public.invites i
  where i.code = p_code
    and i.used_at is null
    and i.expires_at > now()
  for update;

  if v_senior is null then
    raise exception 'invalid_or_expired_invite';
  end if;

  -- 紐付け作成（重複は無視）
  insert into public.family_seniors(family_id, senior_id)
  values (auth.uid(), v_senior)
  on conflict do nothing;

  -- 招待を使用済みにする
  update public.invites
    set used_by_family_id = auth.uid(),
        used_at = now()
  where code = p_code;

  return query select v_senior;
end $$;

-- 関数の実行権限
revoke all on function public.use_invite(text) from public;
grant execute on function public.use_invite(text) to authenticated;

-- family_seniors: 自分が家族側なら自分のリンクだけ見れる
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='family_seniors' and policyname='family_seniors_select_own_family'
  ) then
    create policy "family_seniors_select_own_family"
      on public.family_seniors for select
      to authenticated
      using (family_id = auth.uid());
  end if;
end $$;

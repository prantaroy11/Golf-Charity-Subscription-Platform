-- ============================================================
-- Migration 010 — Foreign Keys & Auto-Create User Trigger
-- Adds charity FK to users + auto-inserts public.users on signup
-- ============================================================

-- Add foreign key from users.charity_id → charities.id
-- (Both tables must exist before this can be applied)
alter table public.users
  add constraint users_charity_id_fkey
  foreign key (charity_id) references public.charities(id);

-- ──────────────────────────────────────────────────────────
-- Trigger function: auto-create a public.users row
-- when a new user signs up via Supabase Auth
-- ──────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger to auth.users table
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

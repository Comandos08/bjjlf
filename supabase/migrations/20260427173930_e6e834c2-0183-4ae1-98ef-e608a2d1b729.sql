create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null,
  created_at timestamptz not null default now(),
  unique (email, source)
);

alter table public.waitlist enable row level security;

create policy "Anyone can join waitlist"
on public.waitlist for insert to public
with check (true);

create policy "Admins can view waitlist"
on public.waitlist for select to authenticated
using (has_admin_role(array['editor','super_admin']));

create policy "Super admins can delete waitlist"
on public.waitlist for delete to authenticated
using (has_admin_role(array['super_admin']));
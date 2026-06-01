-- Subscriptions table for the Stripe paywall.
-- One row per user. Written ONLY by the Stripe webhook (service-role key),
-- read by the user. RLS blocks anon/authenticated writes.

create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  price_id               text,
  status                 text not null default 'inactive', -- active|trialing|past_due|canceled|inactive
  current_period_end     timestamptz,
  updated_at             timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Users may READ their own subscription row. No insert/update/delete policies are
-- defined, so only the service-role key (used by the webhook) can write.
drop policy if exists "read own subscription" on public.subscriptions;
create policy "read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

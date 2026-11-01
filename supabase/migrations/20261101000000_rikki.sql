-- Rikki — schéma Supabase (ADR 0007, ADR 0023, ADR 0024).
-- À coller tel quel dans Supabase → SQL Editor → Run.
-- Principes :
--   * un membre = un utilisateur Supabase (connexion anonyme, ADR 0024) ;
--   * chaque membre ne voit que son foyer (RLS) ;
--   * l'avancement des tâches personnelles, les rappels et les abonnements
--     aux notifications ne sont visibles que par leur membre (ADR 0005) ;
--   * aucune donnée de santé nominative (ADR 0007).

create extension if not exists pgcrypto;

-- ------------------------------------------------------------ Tables

create table if not exists public.foyers (
  id uuid primary key default gen_random_uuid(),
  cree_le timestamptz not null default now(),
  compteur integer not null default 0 check (compteur >= 0),
  maison jsonb not null default '{}'::jsonb,
  code_invitation text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8))
);

create table if not exists public.membres (
  id uuid primary key references auth.users(id) on delete cascade,
  foyer_id uuid not null references public.foyers(id) on delete cascade,
  prenom text not null,
  langue text not null default 'fr' check (langue in ('fr', 'ja')),
  est_aidant boolean not null default false,
  avatar jsonb not null default '{}'::jsonb,
  nom_rikki text not null default 'Rikki',
  notif_emotes boolean not null default false,
  cree_le timestamptz not null default now()
);
create index if not exists membres_foyer on public.membres(foyer_id);

create table if not exists public.taches (
  foyer_id uuid not null references public.foyers(id) on delete cascade,
  id text not null,
  donnees jsonb not null,
  maj_le bigint not null default 0,
  primary key (foyer_id, id)
);

-- Avancement d'une tâche : clé « commun » (pot commun) ou id du membre (tâche personnelle).
create table if not exists public.avancements (
  foyer_id uuid not null references public.foyers(id) on delete cascade,
  tache_id text not null,
  cle text not null,
  etape integer not null default 0,
  derniere_fois bigint,
  maj_le bigint not null default 0,
  primary key (foyer_id, tache_id, cle)
);

create table if not exists public.rappels (
  id uuid primary key default gen_random_uuid(),
  membre_id uuid not null default auth.uid() references public.membres(id) on delete cascade,
  libelle text not null check (char_length(libelle) <= 60),
  heure text not null check (heure ~ '^[0-2][0-9]:[0-5][0-9]$'),
  jours smallint[] not null default '{1,2,3,4,5,6,7}',
  fuseau text not null default 'Europe/Paris',
  actif boolean not null default true
);

create table if not exists public.abonnements_push (
  endpoint text primary key,
  membre_id uuid not null default auth.uid() references public.membres(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  cree_le timestamptz not null default now()
);

-- Une seule émote en attente par destinataire, effacée dès qu'elle est vue (ADR 0025).
create table if not exists public.emotes (
  destinataire uuid primary key references public.membres(id) on delete cascade,
  foyer_id uuid not null references public.foyers(id) on delete cascade,
  de uuid not null references public.membres(id) on delete cascade,
  type text not null check (type in ('calin', 'bisou', 'patpat')),
  envoye_le timestamptz not null default now()
);

-- ------------------------------------------------------------ Sécurité

create or replace function public.mon_foyer() returns uuid
language sql stable security definer set search_path = public as $$
  select foyer_id from public.membres where id = auth.uid()
$$;

alter table public.foyers enable row level security;
alter table public.membres enable row level security;
alter table public.taches enable row level security;
alter table public.avancements enable row level security;
alter table public.rappels enable row level security;
alter table public.abonnements_push enable row level security;
alter table public.emotes enable row level security;

drop policy if exists foyers_lire on public.foyers;
create policy foyers_lire on public.foyers for select using (id = public.mon_foyer());
drop policy if exists foyers_modifier on public.foyers;
create policy foyers_modifier on public.foyers for update using (id = public.mon_foyer()) with check (id = public.mon_foyer());

drop policy if exists membres_lire on public.membres;
create policy membres_lire on public.membres for select using (foyer_id = public.mon_foyer());
drop policy if exists membres_modifier on public.membres;
create policy membres_modifier on public.membres for update using (id = auth.uid()) with check (id = auth.uid() and foyer_id = public.mon_foyer());

drop policy if exists taches_tout on public.taches;
create policy taches_tout on public.taches for all using (foyer_id = public.mon_foyer()) with check (foyer_id = public.mon_foyer());

drop policy if exists avancements_lire on public.avancements;
create policy avancements_lire on public.avancements for select
  using (foyer_id = public.mon_foyer() and (cle = 'commun' or cle = auth.uid()::text));
drop policy if exists avancements_ajouter on public.avancements;
create policy avancements_ajouter on public.avancements for insert
  with check (foyer_id = public.mon_foyer() and (cle = 'commun' or cle = auth.uid()::text));
drop policy if exists avancements_modifier on public.avancements;
create policy avancements_modifier on public.avancements for update
  using (foyer_id = public.mon_foyer() and (cle = 'commun' or cle = auth.uid()::text))
  with check (foyer_id = public.mon_foyer() and (cle = 'commun' or cle = auth.uid()::text));

drop policy if exists rappels_tout on public.rappels;
create policy rappels_tout on public.rappels for all using (membre_id = auth.uid()) with check (membre_id = auth.uid());

drop policy if exists abonnements_tout on public.abonnements_push;
create policy abonnements_tout on public.abonnements_push for all using (membre_id = auth.uid()) with check (membre_id = auth.uid());

drop policy if exists emotes_lire on public.emotes;
create policy emotes_lire on public.emotes for select using (destinataire = auth.uid());
drop policy if exists emotes_effacer on public.emotes;
create policy emotes_effacer on public.emotes for delete using (destinataire = auth.uid());

-- ------------------------------------------------------------ Fonctions appelées par l'app

create or replace function public.creer_foyer(
  p_prenom text, p_langue text, p_avatar jsonb, p_nom_rikki text, p_maison jsonb
) returns public.foyers
language plpgsql security definer set search_path = public as $$
declare
  f public.foyers;
begin
  if auth.uid() is null then raise exception 'non_connecte'; end if;
  if exists (select 1 from public.membres where id = auth.uid()) then raise exception 'deja_membre'; end if;
  insert into public.foyers (maison) values (coalesce(p_maison, '{}'::jsonb)) returning * into f;
  insert into public.membres (id, foyer_id, prenom, langue, est_aidant, avatar, nom_rikki)
    values (auth.uid(), f.id, p_prenom, p_langue, true, p_avatar, p_nom_rikki);
  return f;
end $$;

create or replace function public.rejoindre_foyer(
  p_code text, p_prenom text, p_langue text, p_avatar jsonb, p_nom_rikki text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_foyer uuid;
begin
  if auth.uid() is null then raise exception 'non_connecte'; end if;
  if exists (select 1 from public.membres where id = auth.uid()) then raise exception 'deja_membre'; end if;
  select id into v_foyer from public.foyers
    where code_invitation = upper(regexp_replace(p_code, '[^A-Za-z0-9]', '', 'g'));
  if v_foyer is null then raise exception 'code_inconnu'; end if;
  if (select count(*) from public.membres where foyer_id = v_foyer) >= 6 then raise exception 'foyer_complet'; end if;
  insert into public.membres (id, foyer_id, prenom, langue, est_aidant, avatar, nom_rikki)
    values (auth.uid(), v_foyer, p_prenom, p_langue, false, p_avatar, p_nom_rikki);
  return v_foyer;
end $$;

-- Le compteur ne recule jamais (ADR 0008, ADR 0020) : seul un ajout positif est accepté.
create or replace function public.ajouter_au_compteur(p_delta integer) returns integer
language sql security definer set search_path = public as $$
  update public.foyers set compteur = compteur + least(greatest(p_delta, 0), 50)
  where id = public.mon_foyer()
  returning compteur
$$;

create or replace function public.envoyer_emote(p_vers uuid, p_type text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_vers = auth.uid() then raise exception 'soi_meme'; end if;
  if not exists (select 1 from public.membres where id = p_vers and foyer_id = public.mon_foyer()) then
    raise exception 'pas_du_foyer';
  end if;
  insert into public.emotes (destinataire, foyer_id, de, type, envoye_le)
    values (p_vers, public.mon_foyer(), auth.uid(), p_type, now())
  on conflict (destinataire) do update set de = excluded.de, type = excluded.type, envoye_le = excluded.envoye_le;
end $$;

-- Rappels à envoyer cette minute-ci (appelée par la fonction Edge, clé service uniquement).
create or replace function public.rappels_dus()
returns table (libelle text, langue text, endpoint text, p256dh text, auth text)
language sql stable security definer set search_path = public as $$
  select r.libelle, m.langue, a.endpoint, a.p256dh, a.auth
  from public.rappels r
  join public.membres m on m.id = r.membre_id
  join public.abonnements_push a on a.membre_id = r.membre_id
  where r.actif
    and to_char(now() at time zone r.fuseau, 'HH24:MI') = r.heure
    and extract(isodow from now() at time zone r.fuseau)::int = any (r.jours)
$$;

revoke all on function public.rappels_dus() from public, anon, authenticated;
grant execute on function public.rappels_dus() to service_role;
grant execute on function public.creer_foyer(text, text, jsonb, text, jsonb) to authenticated;
grant execute on function public.rejoindre_foyer(text, text, text, jsonb, text) to authenticated;
grant execute on function public.ajouter_au_compteur(integer) to authenticated;
grant execute on function public.envoyer_emote(uuid, text) to authenticated;

-- ------------------------------------------------------------ Temps réel

do $$
declare t text;
begin
  foreach t in array array['foyers', 'membres', 'taches', 'avancements', 'emotes'] loop
    if not exists (
      select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ------------------------------------------------------------ Quitter le foyer (réglages)

create or replace function public.quitter_foyer() returns void
language plpgsql security definer set search_path = public as $$
declare v_foyer uuid := public.mon_foyer();
begin
  delete from public.membres where id = auth.uid();
  if v_foyer is not null and not exists (select 1 from public.membres where foyer_id = v_foyer) then
    delete from public.foyers where id = v_foyer;
  end if;
end $$;
grant execute on function public.quitter_foyer() to authenticated;

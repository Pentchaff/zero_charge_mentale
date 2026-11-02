-- Rikki — code de retour (ADR 0024) : retrouver sa maison, son avatar et son
-- Rikki si le téléphone a oublié la session (navigateur effacé, nouveau
-- téléphone, passage de Safari à l'app installée).
-- À exécuter après 20261101000000_rikki.sql. Peut être relancé sans danger.

create extension if not exists pgcrypto;

-- Les tables qui pointent vers un membre suivent le changement d'identifiant.
alter table public.rappels drop constraint if exists rappels_membre_id_fkey;
alter table public.rappels add constraint rappels_membre_id_fkey
  foreign key (membre_id) references public.membres(id) on delete cascade on update cascade;
alter table public.abonnements_push drop constraint if exists abonnements_push_membre_id_fkey;
alter table public.abonnements_push add constraint abonnements_push_membre_id_fkey
  foreign key (membre_id) references public.membres(id) on delete cascade on update cascade;
alter table public.emotes drop constraint if exists emotes_destinataire_fkey;
alter table public.emotes add constraint emotes_destinataire_fkey
  foreign key (destinataire) references public.membres(id) on delete cascade on update cascade;
alter table public.emotes drop constraint if exists emotes_de_fkey;
alter table public.emotes add constraint emotes_de_fkey
  foreign key (de) references public.membres(id) on delete cascade on update cascade;

-- Seule l'empreinte du code est gardée. Aucune règle RLS : la table n'est
-- lisible que par les fonctions ci-dessous.
create table if not exists public.codes_retour (
  membre_id uuid primary key references public.membres(id) on delete cascade on update cascade,
  empreinte text not null unique
);
alter table public.codes_retour enable row level security;

create or replace function public.nouveau_code_retour() returns text
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_code text := upper(encode(gen_random_bytes(6), 'hex'));
begin
  if not exists (select 1 from public.membres where id = auth.uid()) then raise exception 'pas_membre'; end if;
  insert into public.codes_retour (membre_id, empreinte)
    values (auth.uid(), encode(digest(v_code, 'sha256'), 'hex'))
  on conflict (membre_id) do update set empreinte = excluded.empreinte;
  return v_code;
end $$;

create or replace function public.reprendre_membre(p_code text) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_code text := upper(regexp_replace(p_code, '[^A-Za-z0-9]', '', 'g'));
  v_ancien uuid;
  v_foyer uuid;
begin
  if auth.uid() is null then raise exception 'non_connecte'; end if;
  if exists (select 1 from public.membres where id = auth.uid()) then raise exception 'deja_membre'; end if;
  select membre_id into v_ancien from public.codes_retour where empreinte = encode(digest(v_code, 'sha256'), 'hex');
  if v_ancien is null then raise exception 'code_retour_inconnu'; end if;
  select foyer_id into v_foyer from public.membres where id = v_ancien;
  update public.membres set id = auth.uid() where id = v_ancien;
  update public.avancements set cle = auth.uid()::text where foyer_id = v_foyer and cle = v_ancien::text;
  update public.taches set donnees = jsonb_set(donnees, '{portee,membreId}', to_jsonb(auth.uid()::text))
    where foyer_id = v_foyer and donnees -> 'portee' ->> 'membreId' = v_ancien::text;
  return v_foyer;
end $$;

revoke all on function public.nouveau_code_retour() from public, anon;
revoke all on function public.reprendre_membre(text) from public, anon;
grant execute on function public.nouveau_code_retour() to authenticated;
grant execute on function public.reprendre_membre(text) to authenticated;

-- Planifie l'envoi des rappels chaque minute (étape facultative, voir docs/INSTALLATION.md).
-- Remplacer <REF_PROJET> et <SECRET_CRON> avant d'exécuter dans Supabase → SQL Editor.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('rikki-rappels') where exists (select 1 from cron.job where jobname = 'rikki-rappels');

select cron.schedule(
  'rikki-rappels',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://<REF_PROJET>.supabase.co/functions/v1/rikki-push',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-rikki-cron', '<SECRET_CRON>'),
    body := '{"type":"cron"}'::jsonb
  );
  $$
);

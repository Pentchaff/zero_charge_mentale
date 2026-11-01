// Fonction Edge « rikki-push » : envoie les notifications Web Push.
//   * { type: "cron" }  : appelée chaque minute par pg_cron, envoie les rappels dus
//                         (en-tête x-rikki-cron = secret RIKKI_CRON_SECRET).
//   * { type: "emote", vers } : appelée par l'app après une émote ; prévient le
//                         destinataire seulement s'il l'a demandé (ADR 0025).
// Secrets à définir : VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, RIKKI_CRON_SECRET.
// « Verify JWT » doit être désactivé (pg_cron n'a pas de jeton utilisateur).

import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'mailto:rikki@example.org',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EMOTES: Record<string, Record<string, string>> = {
  fr: { calin: '{de} t’envoie un câlin 🤗', bisou: '{de} t’envoie un bisou 😘', patpat: '{de} te fait pat pat sur la tête 🫳' },
  ja: { calin: '{de}からハグがとどいたよ 🤗', bisou: '{de}からキスがとどいたよ 😘', patpat: '{de}がよしよししてくれたよ 🫳' },
};

interface Abonnement {
  endpoint: string;
  p256dh: string;
  auth: string;
}

async function envoyer(a: Abonnement, charge: { titre: string; corps: string; tag: string }) {
  try {
    await webpush.sendNotification(
      { endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } },
      JSON.stringify(charge),
      { TTL: 60 * 60 },
    );
  } catch (e) {
    const code = (e as { statusCode?: number }).statusCode;
    // Abonnement expiré ou révoqué : on l'oublie.
    if (code === 404 || code === 410) await admin.from('abonnements_push').delete().eq('endpoint', a.endpoint);
    else console.error('push', code, e);
  }
}

function reponse(corps: unknown, statut = 200) {
  return new Response(JSON.stringify(corps), { status: statut, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const corps = await req.json().catch(() => ({}));

  if (corps.type === 'cron') {
    if (req.headers.get('x-rikki-cron') !== Deno.env.get('RIKKI_CRON_SECRET')) return reponse({ erreur: 'interdit' }, 401);
    const { data, error } = await admin.rpc('rappels_dus');
    if (error) return reponse({ erreur: error.message }, 500);
    const lignes = (data ?? []) as (Abonnement & { libelle: string; langue: string })[];
    await Promise.all(
      lignes.map((l) => envoyer(l, { titre: l.langue === 'ja' ? 'リッキー' : 'Rikki', corps: `🐿️ ${l.libelle}`, tag: 'rappel' })),
    );
    return reponse({ envoyes: lignes.length });
  }

  if (corps.type === 'emote') {
    const jeton = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';
    const { data: utilisateur } = await admin.auth.getUser(jeton);
    if (!utilisateur?.user) return reponse({ erreur: 'non_connecte' }, 401);
    const [{ data: moi }, { data: lui }] = await Promise.all([
      admin.from('membres').select('foyer_id, prenom').eq('id', utilisateur.user.id).single(),
      admin.from('membres').select('foyer_id, langue, notif_emotes').eq('id', corps.vers).single(),
    ]);
    if (!moi || !lui || moi.foyer_id !== lui.foyer_id || !lui.notif_emotes || !EMOTES.fr[corps.typeEmote]) {
      return reponse({ envoye: false });
    }
    const { data: abonnements } = await admin.from('abonnements_push').select('endpoint, p256dh, auth').eq('membre_id', corps.vers);
    const langue = lui.langue === 'ja' ? 'ja' : 'fr';
    const texte = EMOTES[langue][corps.typeEmote].replace('{de}', moi.prenom);
    await Promise.all((abonnements ?? []).map((a) => envoyer(a, { titre: langue === 'ja' ? 'リッキー' : 'Rikki', corps: texte, tag: 'emote' })));
    return reponse({ envoye: true });
  }

  return reponse({ erreur: 'type_inconnu' }, 400);
});

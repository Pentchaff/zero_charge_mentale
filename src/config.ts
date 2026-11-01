// Configuration fournie au moment du build (variables GitHub Actions ou .env.local).
// La clé Supabase « anon » / « publishable » est publique par conception :
// ce sont les règles RLS du schéma qui protègent les données.

export const CONFIG = {
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '',
  supabaseCle: (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '',
  vapidPublique: (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ?? '',
};

/** Sans Supabase configuré, l'app fonctionne entièrement sur l'appareil (ADR 0023). */
export const AVEC_SYNCHRO = Boolean(CONFIG.supabaseUrl && CONFIG.supabaseCle);

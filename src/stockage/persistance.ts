// Que l'app retrouve la maison à la réouverture : on demande au navigateur
// un stockage durable, et l'on repère les navigateurs qui oublient tout à la
// fermeture (navigateurs intégrés aux messageries, stockage bloqué).

export interface DiagnosticStockage {
  /** localStorage utilisable. */
  disponible: boolean;
  /** Navigateur intégré à une app (LINE, Messenger, Instagram…) : souvent effacé à la fermeture. */
  integre: boolean;
  /** iPhone/iPad dans Safari, pas l'app installée sur l'écran d'accueil. */
  iosNavigateur: boolean;
  /** Le navigateur a promis de ne pas effacer (null : inconnu). */
  durable: boolean | null;
}

export function stockageDisponible(): boolean {
  try {
    const cle = 'rikki.test';
    localStorage.setItem(cle, '1');
    const ok = localStorage.getItem(cle) === '1';
    localStorage.removeItem(cle);
    return ok;
  } catch {
    return false;
  }
}

export function navigateurIntegre(ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''): boolean {
  return /\bLine\/|FBAN|FBAV|FB_IAB|Instagram|MicroMessenger|KAKAOTALK|Snapchat|Twitter|GSA\/|; wv\)/i.test(ua);
}

export function estInstallee(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
}

export function estIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

let durable: boolean | null = null;

/** À appeler au démarrage : Chrome, Firefox et Android peuvent alors garder les données. */
export async function demanderStockageDurable(): Promise<void> {
  try {
    if (navigator.storage?.persist) durable = (await navigator.storage.persisted()) || (await navigator.storage.persist());
  } catch {
    durable = null;
  }
}

export function diagnosticStockage(): DiagnosticStockage {
  return {
    disponible: stockageDisponible(),
    integre: navigateurIntegre(),
    iosNavigateur: estIos() && !estInstallee(),
    durable,
  };
}

/** L'app risque-t-elle d'oublier la maison à la fermeture ? */
export function stockageFragile(d = diagnosticStockage()): boolean {
  return !d.disponible || d.integre;
}

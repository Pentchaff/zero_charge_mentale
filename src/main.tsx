import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AVEC_SYNCHRO } from './config';
import { FournisseurApp } from './etat/contexte';
import { backendLocal } from './sync/backendLocal';
import { BackendSupabase } from './sync/backendSupabase';
import './styles.css';

const backend = AVEC_SYNCHRO ? new BackendSupabase() : backendLocal;

createRoot(document.getElementById('racine')!).render(
  <StrictMode>
    <FournisseurApp backend={backend}>
      <App />
    </FournisseurApp>
  </StrictMode>,
);

// PWA (ADR 0004) : le service worker garde l'app disponible hors-ligne et
// reçoit les notifications (rappels, émotes).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('./sw.js');
  });
}

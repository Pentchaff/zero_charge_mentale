import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { FournisseurApp } from './etat/contexte';
import { depotLocal } from './stockage/depotLocal';
import './styles.css';

createRoot(document.getElementById('racine')!).render(
  <StrictMode>
    <FournisseurApp depot={depotLocal}>
      <App />
    </FournisseurApp>
  </StrictMode>,
);

// PWA (ADR 0004) : le service worker garde l'app disponible hors-ligne.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('./sw.js');
  });
}

# Supabase hébergé en Europe pour le stockage partagé

Les données du foyer sont partagées entre deux téléphones. L'app étant une PWA statique (ADR 0004), il faut un service tiers. Supabase fournit base de données, temps réel et authentification (lien magique par e-mail), gratuitement à l'échelle d'un foyer. Le projet est hébergé en Europe (RGPD). Aucune donnée de santé nominative n'est stockée : un rappel de médicament est enregistré comme « rappel du matin », sans nom de molécule ni diagnostic.

## Options écartées

- App local-first avec synchronisation directe entre téléphones : plus séduisant mais nettement plus complexe à implémenter et à débugger.
- Appareil unique partagé (tablette cuisine) : ne fonctionne pas si un membre est au lit.

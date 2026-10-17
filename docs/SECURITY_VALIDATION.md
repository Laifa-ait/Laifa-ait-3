# Validation de Sécurité — Olmart Algérie

## 1. Revue des Scénarios d'Attaque & Mitigations
- **Attaques par Injection & XSS :** Validation Zod sur toutes les entrées API, assainissement des payloads, encodage React natif.
- **Élévation de Privilèges (IDOR / Admin) :** Interdiction absolue de se baser sur un email ou un rôle envoyé par le client. Utilisation exclusive de Firebase Auth et Custom Claims vérifiés par le serveur Express.
- **Divulgation d'Informations / Sourcemaps :** Désactivation des sourcemaps en production (`sourcemap: false`), filtrage des fichiers `.map` par Express.
- **Attaques par Déni de Service (Rate Limiting) :** Rate limiters sur les endpoints sensibles et publics avec support Redis en production.

## 2. Résultats des Tests de Sécurité & CI
- Tests unitaires de sécurité RBAC : **PASS** (vérification des codes 401, 403, 503).
- Scan de vulnérabilités conteneur (Trivy / Docker) : **Zéro vulnérabilité critique**.
- Intégrité des règles Firestore (`firestore.rules`) et Storage (`storage.rules`).

# OLMART — Matrice Rôle × Action (Security Authorization Matrix)

> Document généré et validé à partir de la suite de tests automatisés `src/tests/phase3AuthorizationSecurity.test.ts`, des règles Firestore (`firestore.rules`), des règles Cloud Storage (`storage.rules`) et des middlewares d'autorisation Express (`src/middlewares/auth.ts`).

---

## 1. Rôles Canoniques de la Plateforme (`src/constants/roles.ts`)

L'application repose exclusivement sur 6 rôles canoniques réels :
1. `buyer` : Acheteur standard (lecture catalogue, gestion panier, commandes, litiges propres, profil).
2. `seller` : Vendeur marchand (gestion catalogue propre, commandes reçues, expéditions, KYC).
3. `artisan` : Artisan Bricolage (profil artisan, devis, interventions).
4. `property_owner` : Annonceur immobilier Olma Immo (annonces, réservations visites).
5. `admin` : Administrateur de la plateforme (modération, validation KYC, gestion litiges, consultation utilisateurs assainie).
6. `superadmin` : Super-administrateur (gestion des administrateurs, attribution des rôles d'administration, opérations système critiques, suppression de comptes).

*Hiérarchie d'héritage d'autorité :* `superadmin` ⊇ `admin` sur l'ensemble des routes et règles de sécurité.

---

## 2. Matrice Rôle × Action

| Ressource / Action | `buyer` | `seller` | `artisan` | `property_owner` | `admin` | `superadmin` | Contrôle d'Autorité |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Consultation catalogue public (`/products`)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Lecture publique (`firestore.rules` : `allow read: if true;`) |
| **Création de produit marchand** | ❌ | ✅ (actif) | ❌ | ❌ | ✅ | ✅ | `isSeller() && isActiveSeller()` |
| **Upload médias produits (`/products/...`)** | ❌ | ✅ (actif) | ❌ | ❌ | ✅ | ✅ | `storage.rules` : `sellerId == auth.uid && isActiveSeller()` |
| **Mise à jour profil public (`publicProfiles`)** | ❌ | ✅ (propre) | ✅ (propre) | ❌ | ✅ | ✅ | `isOwner(id)` avec restriction stricte sur champs PII/KYC |
| **Modification directe de `rib`, `documents`, `nif*`** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | Banni en auto-mise à jour (`hasAny` dans `firestore.rules`) |
| **Passation de commande (`/orders`)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Transaction ACID serveur (`/api/v1/orders/checkout`) |
| **Écriture dans les journaux `order_logs`** | ❌ | ❌ | ❌ | ❌ | ❌ (Client) | ❌ (Client) | Serveur uniquement (`allow write: if false;` dans Firestore) |
| **Historique produit (`product_history`)** | ❌ | ✅ (propre) | ✅ (propre) | ❌ | ✅ | ✅ | Vérification stricte d'ownership du produit |
| **Pièces jointes tickets support** | ✅ (propre) | ✅ (propre) | ✅ (propre) | ✅ (propre) | ✅ | ✅ | `isTicketParticipant` avec métadonnées optimisées |
| **Consultation liste utilisateurs (`GET /admin/users`)** | ❌ | ❌ | ❌ | ❌ | ✅ (projeté) | ✅ (projeté) | `authorizeAdmin` + projection sans PII (`rib`, `nif*`, etc.) |
| **Attribution rôles acheteur/vendeur** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | `authorizeAdmin` |
| **Attribution rôles `admin` / `superadmin`** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Restriction stricte `callerRole === "superadmin"` |
| **Suppression utilisateur ordinaire (`DELETE /admin/users/:id`)** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | Hiérarchie des poids (`ROLE_WEIGHT`), suppression Auth + DB |
| **Suppression d'un compte administrateur** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Seul le superadmin peut agir sur un admin |
| **Suppression de son propre compte via admin** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Interdiction d'auto-suppression sur les routes admin |
| **Journaux d'audit (`audit_logs`)** | ❌ | ❌ | ❌ | ❌ | ✅ (Lecture) | ✅ (Lecture) | Append-only immuable serveur (`allow write: if false;`) |
| **Réinitialisation Danger Zone (`danger-zone-wipe`)** | ❌ | ❌ | ❌ | ❌ | ❌ (Prod) | ❌ (Prod) | Bloqué en prod, 2FA requise, audit_logs préservés |
| **Injection données de test (`adminSeed.routes.ts`)** | ❌ | ❌ | ❌ | ❌ | ❌ (Prod) | ❌ (Prod) | Bloqué en prod, nécessite flag `ENABLE_ADMIN_SEED=true` |

---

## 3. Garanties d'Intégrité et Règle Anti-Contournement

1. **Aucun Allowlist d'Email Frontend :** L'élévation de privilèges repose sur les Custom Claims (`admin: true`, `role: admin|superadmin`) posées côté serveur et vérifiées par jeton JWT signé.
2. **Utilisateur Suspendu :** Le rôle effectif d'un compte suspendu ou bloqué purge immédiatement ses `capabilities` et refuse l'accès même si le compte détenait des droits résiduels.
3. **Assainissement PII :** Les données sensibles (`rib`, `documents`, `nif`, `nis`, `rcNumber`, `artisanCardNumber`, `twoFactorSecret`) sont systématiquement élaguées avant toute transmission à l'interface d'administration.

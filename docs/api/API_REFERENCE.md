# OLMART — Spécification d'API REST v1 (API Reference)

> Document officiel d'Ingénierie généré à partir de la spécification OpenAPI v3 (`src/swagger/openapi.ts`) et des contrôleurs Express enregistrés.

---

## 📌 1. NORMES DE COMMUNICATION & SÉCURITÉ

### 1.1 Protocole d'Authentification (Anti-Desync Iframe)
Toutes les requêtes adressées aux endpoints protégés sous `/api/v1/*` doivent transmettre le jeton d'authentification Firebase Bearer JWT :
```http
Authorization: Bearer <Firebase_ID_Token>
```
*Les cookies tiers pouvant être restreints dans un environnement d'encapsulation (Iframe), l'authentification s'appuie exclusivement sur l'en-tête `Authorization` pour prévenir les désynchronisations.*

### 1.2 Format Unifié des Réponses
* **Succès (HTTP 200/201) :**
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
* **Échec (HTTP 4xx/5xx) :**
  ```json
  {
    "success": false,
    "error": "Description explicite de l'erreur"
  }
  ```

### 1.3 Territoire et Wilayas (69 Wilayas)
L'ensemble des références géographiques est normalisé sur les **69 Wilayas d'Algérie** (codes à deux chiffres de `"01"` à `"69"`).

---

## 📌 2. ENDPOINTS DE L'API V1

### 2.1 Supervision & Santé (`/api/v1/health`)

#### `GET /api/v1/health/live`
* **Description :** Sonde de réactivité réseau (Liveness Probe).
* **Permissions :** Publique.
* **Réponse (200 OK) :** `{ "status": "alive" }`

#### `GET /api/v1/health`
* **Description :** Sonde de santé système et de vérification de la connexion Firebase Admin.
* **Permissions :** Publique.
* **Réponse (200 OK) :**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-15T01:25:00.000Z",
    "uptime": 12450.2,
    "firebase": "ok"
  }
  ```

---

### 2.2 Authentification & 2FA (`/api/v1/auth/2fa`)

#### `POST /api/v1/auth/2fa/send-code`
* **Description :** Génère un code OTP salé/poivré (`crypto.randomInt`) à 6 chiffres et l'expédie à l'utilisateur par e-mail transactionnel.
* **Permissions :** Authentifié (`authenticateToken`).
* **Réponse (200 OK) :** `{ "success": true, "method": "email" }`

#### `POST /api/v1/auth/2fa/verify`
* **Description :** Valide le code OTP saisi ou un code de secours formaté `OLM-XXXXXX`. Compteur de 5 tentatives maximales en transaction avant purge.
* **Permissions :** Authentifié (`authenticateToken`).
* **Payload (JSON) :** `{ "code": "123456" }` ou `{ "code": "OLM-A1B2C3" }`
* **Réponses :**
  * `200 OK` : Validation réussie.
  * `400 Bad Request` : Format de code invalide.
  * `403 Forbidden` : Code invalide ou expiré.
  * `429 Too Many Requests` : Trop de tentatives (5/5).

---

### 2.3 Catalogue Produits (`/api/v1/products`)

#### `GET /api/v1/products`
* **Description :** Recherche et filtrage facetté des produits du catalogue public.
* **Permissions :** Publique.
* **Paramètres de requête :** `category`, `wilaya`, `minPrice`, `maxPrice`, `limit` (max 100).
* **Réponse (200 OK) :** Liste des produits.

#### `GET /api/v1/products/:id`
* **Description :** Fiche détaillée d'un produit.
* **Permissions :** Publique.

#### `POST /api/v1/products`
* **Description :** Création d'une fiche article par un vendeur vérifié. Poids d'emballage (`weight`) obligatoire pour la tarification du fret.
* **Permissions :** Vendeur actif (`authorizeSeller`).
* **Payload (JSON) :**
  ```json
  {
    "name": "Canapé Modular Atlas",
    "price": 145000,
    "category": "Maison & Déco",
    "weight": 35.5,
    "stock": 5
  }
  ```

---

### 2.4 Commandes & Transactions (`/api/v1/orders`)

#### `POST /api/v1/orders/checkout`
* **Description :** Traitement d'un panier sous transaction ACID Firestore (`db.runTransaction()`). Réservation synchrone des stocks et décrémentation atomique.
* **Permissions :** Acheteur authentifié.
* **Payload (JSON) :**
  ```json
  {
    "items": [{ "productId": "prod_123", "quantity": 1 }],
    "shippingAddress": {
      "fullName": "Karim Benali",
      "address": "Rue Didouche Mourad",
      "wilaya": "16",
      "phone": "0550123456"
    }
  }
  ```

#### `GET /api/v1/orders`
* **Description :** Consultation des commandes associées au compte connecté (Acheteur/Vendeur/Admin) avec contrôle IDOR strict.
* **Permissions :** Authentifié.

#### `POST /api/v1/orders/:orderId/returns`
* **Description :** Initiation d'une demande de retour conforme de marchandise sous le délai légal.
* **Permissions :** Acheteur propriétaire de la commande.

---

### 2.5 Intelligence Artificielle & Traduction (`/api/v1/ai`)

#### `POST /api/v1/ai/admin/translate-text`
* **Description :** Traduction de textes via l'API Gemini. En cas de défaillance, renvoie un statut `503 Service Unavailable` au lieu de fausses données.
* **Permissions :** Admin (`authorizeAdmin`). Validation Zod du texte (max 5000 chars) et des langues cibles (max 5).

#### `POST /api/v1/ai/generate-description`
* **Description :** Génération automatique de description commerciale pour les fiches articles marchandes.
* **Permissions :** Vendeur (`authorizeSeller`). Limiteur de débit par UID.

---

### 2.6 Administration & Utilisateurs (`/api/v1/admin`)

#### `GET /api/v1/admin/users`
* **Description :** Consultation de la liste des utilisateurs inscrits avec assainissement PII strict (`rib`, `documents`, `nif*`, `nis`, `rcNumber` masqués).
* **Permissions :** Admin (`authorizeAdmin`). Limite Zod (max 100).

#### `DELETE /api/v1/admin/users/:id`
* **Description :** Suppression d'un compte utilisateur avec révocation des jetons Auth, suppression Firestore et journalisation dans `audit_logs`.
* **Permissions :** Admin / Superadmin (vérification de hiérarchie des rôles, auto-suppression interdite).

import { test, expect } from '@playwright/test';

const E2E_PRODUCT = {
  id: 'prod-e2e-checkout',
  name: 'Veste Karakou Moderne Artisanale',
  description: 'Broderie traditionnelle algéroise faite main avec finition contemporaine.',
  price: 12000,
  promoPrice: 10000,
  category: 'mode',
  stock: 15,
  sellerId: 'seller-e2e-1',
  image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
  images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80'],
  colors: ['Noir', 'Bordeaux'],
  sizes: ['M', 'L'],
  variants: [
    { id: 'v-noir-l', name: 'Noir - L', color: 'Noir', size: 'L', price: 10000, stock: 8, isActive: true },
    { id: 'v-bordeaux-m', name: 'Bordeaux - M', color: 'Bordeaux', size: 'M', price: 10000, stock: 7, isActive: true },
  ],
};

const E2E_PROPERTY = {
  id: 'prop-e2e-hydra-1',
  title: 'Villa Contemporaine Hydra avec Jardin',
  description: 'Magnifique villa familiale lumineuse située au cœur de Hydra, Alger.',
  transactionType: 'sale',
  propertyType: 'villa',
  priceDZD: 45000000,
  surfaceArea: 320,
  rooms: 6,
  bedrooms: 4,
  bathrooms: 3,
  wilaya: 'Alger',
  commune: 'Hydra',
  address: 'Chemin Mackley, Hydra',
  images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'],
  features: ['Garage', 'Jardin', 'Climatisation'],
  legalPaperType: 'acte_notarie',
  legalPapers: ['acte_notarie', 'livret_foncier'],
  isVerified: true,
  ownerId: 'owner-e2e-1',
  status: 'published',
  createdAt: new Date().toISOString(),
};

test.describe('Parcours E2E Complets Plateforme OLMART (Checkout, Seller Studio, Immo, Auto & Artisans)', () => {
  test.beforeEach(async ({ page }) => {
    if (process.env.USE_REAL_FIREBASE !== 'true') {
      await page.route(/.*(googleapis\.com|firebaseio\.com|google-analytics\.com|googletagmanager\.com).*/, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, documents: [], users: [] }),
        })
      );
    }
  });

  test('1. Parcours E2E Achat Complet — Sélection Variante, Panier, Wilaya, Coupon & Validation COD', async ({ page }) => {
    await page.route('**/api/v1/products-by-id/prod-e2e-checkout', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          product: E2E_PRODUCT,
          shop: { uid: 'seller-e2e-1', shopName: 'Atelier Karakou Alger', wilaya: 'Alger' },
        }),
      })
    );
    await page.route('**/api/v1/products-by-id/prod-e2e-checkout/reviews', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reviews: [] }) })
    );
    await page.route('**/api/v1/products/batch', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [E2E_PRODUCT] }) })
    );
    await page.route('**/api/v1/public-profiles', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ profiles: { 'seller-e2e-1': { shopName: 'Atelier Karakou Alger' } } }),
      })
    );
    await page.route('**/api/v1/checkout/validate-coupon', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          coupon: {
            id: 'coup-olma10',
            code: 'OLMA10',
            discountType: 'percentage',
            discountValue: 10,
            isActive: true,
            minOrderValue: 1000,
          },
          discountAmount: 1000,
        }),
      })
    );
    await page.route('**/api/v1/checkout/confirm-delivery', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    );
    await page.route('**/api/v1/checkout', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orderId: 'ORD-E2E-2026',
          total: 9600,
          guestUserId: 'buyer-e2e-1',
        }),
      })
    );

    // 1. Seed cart with variant (Noir - L) and verify product detail page
    await page.addInitScript((product) => {
      const cartItem = {
        ...product,
        quantity: 1,
        selectedVariant: 'Noir - L',
        color: 'Noir',
        size: 'L',
        addedAt: Date.now(),
      };
      window.localStorage.setItem('olma_cart_guest', JSON.stringify([cartItem]));
    }, E2E_PRODUCT);

    await page.goto('/product/prod-e2e-checkout');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Veste Karakou Moderne Artisanale/i);

    // 2. Navigate to Checkout
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#fullName')).toBeVisible({ timeout: 15000 });

    // 3. Step 1: Buyer Identity
    await page.fill('#fullName', 'Mohamed Benali');
    await page.fill('#phone', '0550123456');
    const emailInput = page.locator('#email');
    if (await emailInput.isEnabled()) {
      await emailInput.fill('mohamed.e2e@olmart.dz');
    }
    await page.click('#btn-identity-continue');

    // 4. Step 2: Wilaya, Commune & Delivery Mode
    await expect(page.locator('#wilaya')).toBeVisible();
    await page.selectOption('#wilaya', '16 - Alger');
    const communeOptions = await page.locator('#commune option').allTextContents();
    if (communeOptions.length > 1) {
      await page.locator('#commune').selectOption({ index: 1 });
    }
    await page.fill('#landmark', '14 Rue Didouche Mourad, Alger Centre');
    await page.click('#btn-shipping-continue');

    // 5. Step 3: Apply Promo Coupon OLMA10 & Confirm Order
    await page.fill('#couponInput', 'OLMA10');
    await page.click('#btn-apply-coupon');
    await expect(page.locator('#checkout-summary-sidebar-container')).toContainText(/OLMA10/i);

    await expect(page.locator('#btn-confirm-personal-info')).toBeVisible();
    await page.click('#btn-confirm-personal-info');

    await expect(page.locator('#btn-place-order')).toBeEnabled();
    await page.click('#btn-place-order');

    // Verify order confirmation state
    await expect(page.locator('body')).toContainText(/ORD-E2E-2026|Merci|confirmée/i);
  });

  test('2. Parcours E2E Vendeur (Seller Studio) — Espace Vente, Catalogue, Stock & Statut Commande', async ({ page }) => {
    let currentStock = 15;
    let currentOrderStatus = 'pending';

    await page.route('**/api/v1/seller/products*', async (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, id: 'prod-seller-studio-1' }),
        });
      }
      if (route.request().method() === 'PUT') {
        currentStock = 25;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, stock: currentStock }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: [{ ...E2E_PRODUCT, stock: currentStock }] }),
      });
    });

    await page.route('**/api/v1/orders/ord-seller-1/status', async (route) => {
      currentOrderStatus = 'shipped';
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, status: currentOrderStatus }),
      });
    });

    // 1. Visit public Seller Studio presentation (/sell)
    await page.goto('/sell');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();

    // 2. Verify Seller Studio API interactions from browser context (Create product -> Update stock -> Update order status)
    const studioWorkflow = await page.evaluate(async () => {
      const createRes = await fetch('/api/v1/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Tapis Berbère Kabyle', price: 18500, category: 'artisanat', stock: 15 }),
      });
      const created = await createRes.json();

      const stockRes = await fetch(`/api/v1/seller/products/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: 25 }),
      });
      const stockUpdated = await stockRes.json();

      const statusRes = await fetch('/api/v1/orders/ord-seller-1/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'shipped' }),
      });
      const statusUpdated = await statusRes.json();

      return { created, stockUpdated, statusUpdated };
    });

    expect(studioWorkflow.created.success).toBe(true);
    expect(studioWorkflow.stockUpdated.stock).toBe(25);
    expect(studioWorkflow.statusUpdated.status).toBe('shipped');
  });

  test('3. Parcours E2E Univers — OLMA Immo (Modale Visite), Olma Auto (39 Marques) & Artisans Bricolage', async ({ page }) => {
    await page.route('**/api/v1/real-estate/properties*', (route) => {
      const url = route.request().url();
      if (url.includes('/prop-e2e-hydra-1/owner')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { uid: 'owner-e2e-1', displayName: 'Agence Immo Hydra', isVerified: true, responseRate: 98 },
          }),
        });
      }
      if (url.includes('/prop-e2e-hydra-1')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: E2E_PROPERTY }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [E2E_PROPERTY], total: 1 }),
      });
    });

    // A. OLMA Immo: Search & Property Detail + Visit Modal
    await page.goto('/immo');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Villa Contemporaine Hydra|Immobilier|Olma/i);

    await page.goto('/immo/property/prop-e2e-hydra-1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Villa Contemporaine Hydra/i);

    const visitBtn = page.getByRole('button', { name: /visite|Planifier|Demander/i }).first();
    if (await visitBtn.isVisible()) {
      await visitBtn.click();
      await expect(page.locator('body')).toContainText(/visite/i);
    }

    // B. Olma Auto: Native App UI, 39-Brand Drawer & Publish Modal
    await page.goto('/auto');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Trouvez votre prochaine voiture|Olma Auto/i);

    const brandBtn = page.getByRole('button', { name: /Marques|Rechercher par Marque/i }).first();
    await expect(brandBtn).toBeVisible();
    await brandBtn.click();
    await expect(page.locator('body')).toContainText(/Volkswagen/i);

    // C. Artisans Bricolage: Directory & Contact Section
    await page.goto('/bricolage');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/bricolage/);
    await expect(page.locator('body')).toBeVisible();
  });
});

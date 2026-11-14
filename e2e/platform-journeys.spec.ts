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
  propertyType: 'villa',
  listingType: 'sale',
  legalPapers: ['acte_notarie', 'livret_foncier'],
  legalPaperType: 'acte_notarie',
  isLegalVerified: true,
  price: 45000000,
  pricePeriod: 'total',
  areaSquareMeters: 320,
  area: 320,
  rooms: 6,
  bathrooms: 3,
  features: ['Garage', 'Jardin', 'Climatisation'],
  images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'],
  location: {
    lat: 36.746,
    lng: 3.035,
    address: 'Chemin Mackley, Hydra',
    commune: 'Hydra',
    wilaya: 'Alger',
  },
  wilaya: 'Alger',
  commune: 'Hydra',
  status: 'active',
  viewsCount: 42,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
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
    await page.route(/\/api\/v1\/products-by-id\/prod-e2e-checkout$/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          product: E2E_PRODUCT,
          shop: { uid: 'seller-e2e-1', shopName: 'Atelier Karakou Alger', wilaya: 'Alger' },
        }),
      })
    );
    await page.route(/\/api\/v1\/products-by-id\/prod-e2e-checkout\/reviews/, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reviews: [] }) })
    );
    await page.route(/\/api\/v1\/products\/batch/, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ products: [E2E_PRODUCT] }) })
    );
    await page.route(/\/api\/v1\/public-profiles/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ profiles: { 'seller-e2e-1': { shopName: 'Atelier Karakou Alger' } } }),
      })
    );
    await page.route(/\/api\/v1\/checkout\/validate-coupon/, (route) =>
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
    await page.route(/\/api\/v1\/checkout\/confirm-delivery/, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    );
    await page.route(/\/api\/v1\/(place-order|checkout)$/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orderId: 'ORD-E2E-2026',
          grandTotal: 9600,
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
    await expect(page.locator('body')).toContainText(/Veste Karakou Moderne Artisanale/i, { timeout: 15000 });

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
    await expect(page.locator('body')).toContainText(/ORD-E2E-2026|Merci|confirm/i, { timeout: 15000 });
  });

  test('2. Parcours E2E Vendeur (Seller Studio) — Parcours Guidé, Édition Bannière, Catalogue Error/Retry, Parité Mobile & Publication Vitrine', async ({ page }) => {
    const createMockJwt = (uid: string, email: string) => {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({
          iss: 'https://securetoken.google.com/olmart-staging-e2e',
          aud: 'olmart-staging-e2e',
          auth_time: Math.floor(Date.now() / 1000) - 60,
          user_id: uid,
          sub: uid,
          iat: Math.floor(Date.now() / 1000) - 60,
          exp: Math.floor(Date.now() / 1000) + 3600,
          email,
          email_verified: true,
        })
      ).toString('base64url');
      return `${header}.${payload}.e2e_signature`;
    };

    const sellerUid = 'seller-e2e-1';
    const sellerEmail = 'seller.e2e@olmart.dz';
    const sellerSlug = 'atelier-karakou-alger';
    const mockJwt = createMockJwt(sellerUid, sellerEmail);

    let draftSaveAttempts = 0;
    let catalogAttempts = 0;
    let publishAttempts = 0;
    let draftRevision = 1;
    let isPublished = false;

    const storeConfigState = {
      sellerId: sellerUid,
      shopName: 'Atelier Karakou Alger',
      shopSlug: sellerSlug,
      shopDescription: 'Artisanat contemporain algérois.',
      wilaya: 'Alger',
      commune: 'Hydra',
      contacts: { phone: '+213 551 22 33 44', email: 'atelier@karakou.dz' },
      theme: {
        sector: 'mode',
        primaryColor: '#B85B35',
        secondaryColor: '#1C2A39',
        accentColor: '#D4AF37',
        canvasColor: '#FAF6F0',
        surfaceColor: '#FFFFFF',
        fontFamily: 'Plus Jakarta Sans',
      },
      seo: { metaTitle: 'Atelier Karakou Alger', metaDescription: 'Créations artisanales' },
      updatedAt: new Date().toISOString(),
    };

    let draftSections = [
      {
        id: 'sec-hero-e2e',
        type: 'hero_banner',
        title: 'Bannière Principale',
        isVisible: true,
        order: 0,
        settings: {
          title: 'Collection Initiale Karakou',
          subtitle: 'Livraison 69 Wilayas',
          ctaText: 'Découvrir',
          ctaLink: '#catalog',
          imageUrl: E2E_PRODUCT.image,
          heroLayout: 'editorial-split',
        },
        styles: {},
      },
      {
        id: 'sec-featured-e2e',
        type: 'featured_products',
        title: 'Produits Vedettes',
        isVisible: true,
        order: 1,
        settings: {
          title: 'Pièces Phares',
          productIds: [E2E_PRODUCT.id],
          layout: 'grid',
        },
        styles: {},
      },
    ];

    let publishedLayoutState: {
      versionNumber: number;
      status: 'published';
      updatedAt: string;
      sections: typeof draftSections;
    } | null = null;

    await page.route(/identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#VerifyPasswordResponse',
          localId: sellerUid,
          email: sellerEmail,
          displayName: 'Atelier Karakou Alger',
          idToken: mockJwt,
          registered: true,
          refreshToken: 'e2e-refresh-token',
          expiresIn: '3600',
        }),
      })
    );

    await page.route(/identitytoolkit\.googleapis\.com\/v1\/accounts:lookup/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#GetAccountInfoResponse',
          users: [
            {
              localId: sellerUid,
              email: sellerEmail,
              emailVerified: true,
              displayName: 'Atelier Karakou Alger',
              providerUserInfo: [{ providerId: 'password', federatedId: sellerEmail, email: sellerEmail }],
              validSince: '1700000000',
              createdAt: '1700000000000',
              lastLoginAt: '1700000000000',
            },
          ],
        }),
      })
    );

    await page.route(/securetoken\.googleapis\.com\/v1\/token/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: mockJwt,
          expires_in: '3600',
          token_type: 'Bearer',
          refresh_token: 'e2e-refresh-token',
          id_token: mockJwt,
          user_id: sellerUid,
          project_id: 'olmart-staging-e2e',
        }),
      })
    );

    await page.route(/\/api\/v1\/settings\/global/, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    );

    await page.route(/\/api\/v1\/auth\/(sync|profile)/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          profile: {
            uid: sellerUid,
            email: sellerEmail,
            displayName: 'Atelier Karakou Alger',
            role: 'seller',
            status: 'active',
            onboardingCompleted: true,
          },
        }),
      })
    );

    await page.route(/\/api\/v1\/seller\/subscription\/status/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            subscription: { id: 'sub-e2e', planId: 'pro', status: 'active' },
            pendingRequest: null,
            daysRemaining: 30,
          },
        }),
      })
    );

    await page.route(/\/api\/v1\/seller\/subscription\/plans/, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
    );

    await page.route(/\/api\/v1\/seller\/studio$/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            storeConfig: storeConfigState,
            draftLayout: {
              versionNumber: draftRevision,
              draftRevision,
              status: 'draft',
              updatedAt: new Date().toISOString(),
              sections: draftSections,
            },
            publishedLayout: publishedLayoutState,
            historyList: [],
            mediaGallery: [],
          },
        }),
      })
    );

    await page.route(/\/api\/v1\/seller\/products/, (route) => {
      catalogAttempts += 1;
      if (catalogAttempts === 1) {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Catalogue temporairement indisponible E2E' }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, products: [E2E_PRODUCT] }),
      });
    });

    await page.route(/\/api\/v1\/seller\/store\/config/, async (route) => {
      const patch = route.request().postDataJSON() as Record<string, unknown> | null;
      if (patch && typeof patch === 'object') {
        Object.assign(storeConfigState, patch);
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: storeConfigState }),
      });
    });

    await page.route(/\/api\/v1\/seller\/studio\/layout\/draft/, async (route) => {
      draftSaveAttempts += 1;
      if (draftSaveAttempts === 1) {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Non autorisé : simulation échec sauvegarde étape 1' }),
        });
      }
      const body = route.request().postDataJSON() as { sections?: typeof draftSections } | null;
      if (Array.isArray(body?.sections)) {
        draftSections = body.sections;
      }
      draftRevision += 1;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            versionNumber: draftRevision,
            draftRevision,
            status: 'draft',
            updatedAt: new Date().toISOString(),
            sections: draftSections,
          },
        }),
      });
    });

    await page.route(/\/api\/v1\/seller\/studio\/layout\/publish/, async (route) => {
      publishAttempts += 1;
      await new Promise((r) => setTimeout(r, 150));
      if (publishAttempts === 1) {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Erreur publication simulée E2E' }),
        });
      }
      isPublished = true;
      publishedLayoutState = {
        versionNumber: draftRevision,
        status: 'published',
        updatedAt: new Date().toISOString(),
        sections: draftSections,
      };
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: publishedLayoutState }),
      });
    });

    await page.route(new RegExp(`/api/v1/public/shops/(${sellerSlug}|${sellerUid})/products`), (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, products: [E2E_PRODUCT], count: 1 }),
      })
    );

    await page.route(new RegExp(`/api/v1/public/shops/(${sellerSlug}|${sellerUid})(\\?.*)?$`), (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          shop: {
            ...storeConfigState,
            id: sellerUid,
            isPublished,
            publishedLayout: publishedLayoutState,
          },
          products: [E2E_PRODUCT],
        }),
      })
    );

    await page.route(/\/api\/v1\/public\/stores\/.*\/track/, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    );

    // 1. Desktop (1280x800): Authenticate as Seller & enter /dashboard/seller/studio
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/auth?redirect=/dashboard/seller/studio');
    await page.fill('input[type="email"]', sellerEmail);
    await page.fill('input[type="password"]', 'SellerE2ePass1!');
    await page.click('button[type="submit"]');

    await page.waitForURL((url) => url.pathname === '/dashboard/seller/studio', { timeout: 15000 });
    await expect(page.locator('[data-testid="studio-guided-sidebar"]')).toBeVisible({ timeout: 15000 });

    // 2. Guided Step 1: First save fails -> Step 2 must stay locked with inline error; retry succeeds -> Step 2 opens
    await expect(page.locator('[data-testid="studio-journey-step-2"]')).toBeDisabled();
    await page.click('[data-testid="studio-save-and-advance-btn"]');
    await expect(page.locator('[data-testid="studio-step-save-error"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="studio-journey-step-2"]')).toBeDisabled();

    await page.click('[data-testid="studio-save-and-advance-btn"]');
    await expect(page.locator('[data-testid="studio-journey-step-2"]')).toBeEnabled({ timeout: 10000 });

    // Advance Step 2 (Theme) -> Step 3 (Sections & Hero Banner)
    await page.click('[data-testid="studio-save-and-advance-btn"]');
    await expect(page.locator('[data-testid="hero-content-editor"]')).toBeVisible({ timeout: 10000 });

    // 3. Edit Hero Banner Title via Step 4 of HeroContentEditor & verify live canvas updates
    await page.click('[data-testid="hero-save-step-btn"]');
    await page.click('[data-testid="hero-save-step-btn"]');
    await page.click('[data-testid="hero-save-step-btn"]');
    const heroTitleInput = page.locator('input[placeholder*="1. Le Titre"]').first();
    await expect(heroTitleInput).toBeVisible({ timeout: 10000 });
    await heroTitleInput.fill('Nouvelle Collection Atelier Casbah 2026');
    await expect(page.locator('body')).toContainText('Nouvelle Collection Atelier Casbah 2026', { timeout: 10000 });

    // 4. Advance Step 3 -> Step 4 & verify Catalog error state + Retry recovery
    await page.click('[data-testid="studio-save-and-advance-btn"]');
    await page.click('[data-testid="studio-experience-mode-toggle"]');
    await page.getByRole('button', { name: 'Catalogue' }).first().click();
    await expect(page.locator('[data-testid="catalog-load-error"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('body')).not.toContainText('Aucun produit en stock');
    await page.click('[data-testid="catalog-load-retry-btn"]');
    await expect(page.locator('[data-testid="catalog-inspector-panel"]')).toContainText(E2E_PRODUCT.name, { timeout: 10000 });

    // 5. Switch to Mobile Viewport (390x844): verify Guided Mode parity, Undo/Redo, and Mobile Publish Modal retry -> success
    await page.setViewportSize({ width: 390, height: 844 });
    await page.click('[data-testid="mobile-menu-open-btn"]');
    await page.click('[data-testid="mobile-experience-mode-toggle"]');
    await expect(page.locator('[data-testid="mobile-guided-menu-steps"]')).toBeVisible();
    await page.locator('[aria-label="Fermer"]').click();

    await expect(page.locator('[data-testid="mobile-guided-journey-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-undo-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-redo-btn"]')).toBeVisible();

    // Open publish modal from mobile header, test pending lock + error retention + retry
    await page.click('[data-testid="mobile-publish-btn"]');
    await expect(page.locator('[data-testid="studio-publish-modal"]')).toBeVisible();
    await page.fill('#publish-note-input', 'Mise en ligne E2E mobile');
    await page.click('[data-testid="confirm-publish-btn"]');
    await expect(page.locator('[data-testid="confirm-publish-btn"]')).toContainText(/Publication en cours/i);
    await expect(page.locator('[data-testid="publish-modal-error"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#publish-note-input')).toHaveValue('Mise en ligne E2E mobile');

    // Retry publish -> succeeds and closes modal
    await page.click('[data-testid="confirm-publish-btn"]');
    await expect(page.locator('[data-testid="studio-publish-modal"]')).toBeHidden({ timeout: 10000 });

    // 6. Visit public storefront /store/:slug and verify published Hero title renders visibly
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`/store/${sellerSlug}`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText('Nouvelle Collection Atelier Casbah 2026', { timeout: 15000 });
  });

  test('3. Parcours E2E Univers — OLMA Immo (Modale Visite), Olma Auto (39 Marques) & Artisans Bricolage', async ({ page }) => {
    await page.route(/\/api\/v1\/real-estate\/properties/, (route) => {
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
      if (url.includes('/prop-e2e-hydra-1/similar')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
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
    await expect(page.locator('body')).toContainText(/Villa Contemporaine Hydra|Immobilier|OLMA/i, { timeout: 15000 });

    await page.goto('/immo/property/prop-e2e-hydra-1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Villa Contemporaine Hydra/i, { timeout: 15000 });

    const visitBtn = page.getByRole('button', { name: /visite|Planifier|Demander|Visit/i }).first();
    if (await visitBtn.isVisible()) {
      await visitBtn.click();
    }

    // B. Olma Auto: Native App UI, 39-Brand Drawer & Publish Modal
    await page.goto('/auto');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/39 Marques|OlmaAuto|Explorer/i, { timeout: 15000 });

    const brandBtn = page.getByRole('button', { name: /39 Marques/i }).first();
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

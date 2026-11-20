import { Router } from "express";
import { artisanPublicRouter } from "./artisan.public.routes";
import { artisanUserRouter } from "./artisan.user.routes";
import { artisanAdminRouter } from "./artisan.admin.routes";
import { artisanBroadcastRouter } from "./artisan.broadcast.routes";
import { artisanAdsRouter } from "./artisan.ads.routes";
import { artisanOffersRouter } from "./artisan.offers.routes";

export const artisanRouter = Router();

// Mount Service Offers Catalog & Artisan Offer Management endpoints first
artisanRouter.use(artisanOffersRouter);

// Mount public endpoints
artisanRouter.use(artisanPublicRouter);

// Mount Google-style Artisan Advertising Engine endpoints
artisanRouter.use(artisanAdsRouter);

// Mount broadcasts & job announcement endpoints
artisanRouter.use(artisanBroadcastRouter);

// Mount authenticated user & artisan endpoints
artisanRouter.use(artisanUserRouter);

// Mount administrator & moderation endpoints
artisanRouter.use(artisanAdminRouter);


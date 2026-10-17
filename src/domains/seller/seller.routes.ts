import { Router } from "express";
import sellerProductRouter from "./controllers/SellerProductController";
import sellerProductLifecycleRouter from "./controllers/SellerProductLifecycleController";
import sellerAnalyticsRouter from "./controllers/SellerAnalyticsController";
import sellerProfileRouter from "./controllers/SellerProfileController";
import sellerReviewRouter from "./controllers/SellerReviewController";
import sellerSponsorshipRouter from "./controllers/SellerSponsorshipController";
import sellerOrderRouter from "./controllers/SellerOrderController";
import sellerCouponRouter from "./controllers/SellerCouponController";
import sellerSponsoredCampaignRouter from "../sponsorship/controllers/sellerSponsoredCampaign.controller";
import sellerSubscriptionRouter from "./controllers/SellerSubscriptionController";
import sellerStudioRouter from "./controllers/SellerStudioController";
import sellerMarketingRouter from "./controllers/SellerMarketingController";

const router = Router();

// Mount modular sub-controllers for Seller Domain
router.use(sellerProductRouter);
router.use(sellerProductLifecycleRouter);
router.use(sellerAnalyticsRouter);
router.use(sellerProfileRouter);
router.use(sellerReviewRouter);
router.use(sellerSponsorshipRouter);
router.use(sellerOrderRouter);
router.use(sellerCouponRouter);
router.use(sellerSponsoredCampaignRouter);
router.use(sellerSubscriptionRouter);
router.use(sellerStudioRouter);
router.use(sellerMarketingRouter);

export default router;

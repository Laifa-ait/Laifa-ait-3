import { Router } from "express";
import {
  getShippingLocations,
  calculateShippingRates,
  getCarriers,
  getDairas,
  getCommunes,
  calculateCarrierRate,
} from "./controllers/ShippingController";

const router = Router();

router.get("/locations", getShippingLocations);
router.post("/rates", calculateShippingRates);
router.get("/carriers", getCarriers);
router.post("/calculate-rate", calculateCarrierRate);
router.get("/dairas", getDairas);
router.get("/communes", getCommunes);

export default router;

import {registerRoute as workbox_routing_registerRoute} from '/app/applet/node_modules/workbox-routing/registerRoute.mjs';
import {ExpirationPlugin as workbox_expiration_ExpirationPlugin} from '/app/applet/node_modules/workbox-expiration/ExpirationPlugin.mjs';
import {CacheableResponsePlugin as workbox_cacheable_response_CacheableResponsePlugin} from '/app/applet/node_modules/workbox-cacheable-response/CacheableResponsePlugin.mjs';
import {CacheFirst as workbox_strategies_CacheFirst} from '/app/applet/node_modules/workbox-strategies/CacheFirst.mjs';
import {StaleWhileRevalidate as workbox_strategies_StaleWhileRevalidate} from '/app/applet/node_modules/workbox-strategies/StaleWhileRevalidate.mjs';
import {NetworkFirst as workbox_strategies_NetworkFirst} from '/app/applet/node_modules/workbox-strategies/NetworkFirst.mjs';
import {clientsClaim as workbox_core_clientsClaim} from '/app/applet/node_modules/workbox-core/clientsClaim.mjs';
import {precacheAndRoute as workbox_precaching_precacheAndRoute} from '/app/applet/node_modules/workbox-precaching/precacheAndRoute.mjs';
import {cleanupOutdatedCaches as workbox_precaching_cleanupOutdatedCaches} from '/app/applet/node_modules/workbox-precaching/cleanupOutdatedCaches.mjs';
import {NavigationRoute as workbox_routing_NavigationRoute} from '/app/applet/node_modules/workbox-routing/NavigationRoute.mjs';
import {createHandlerBoundToURL as workbox_precaching_createHandlerBoundToURL} from '/app/applet/node_modules/workbox-precaching/createHandlerBoundToURL.mjs';/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */




self.skipWaiting();
workbox_core_clientsClaim();
/**
 * The precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
workbox_precaching_precacheAndRoute([
  {
    "url": "ws-filter.js",
    "revision": "38291d4df22ebf996995b5d5caacfa4b"
  },
  {
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  },
  {
    "url": "olmart_logo.svg",
    "revision": "a4ddf3647695790ba247a70ad88021af"
  },
  {
    "url": "logo.svg",
    "revision": "a4ddf3647695790ba247a70ad88021af"
  },
  {
    "url": "index.html",
    "revision": "bf521626bb2c5a21ed126f36ddc25315"
  },
  {
    "url": "firebase-messaging-sw.js",
    "revision": "6545bf48faa0864d9213f7850e197e85"
  },
  {
    "url": "favicon.svg",
    "revision": "a4ddf3647695790ba247a70ad88021af"
  },
  {
    "url": "images/immo-property-placeholder.svg",
    "revision": "fd26e86b6892a743bd835aeea2f291ab"
  },
  {
    "url": "images/placeholders/product.svg",
    "revision": "bea57a58502afa3535496933fb31c99f"
  },
  {
    "url": "images/placeholders/category.svg",
    "revision": "92cb5cb8c8ec565a860fa46ce43476f7"
  },
  {
    "url": "brands/volkswagen.svg",
    "revision": "7fa363034a5c6495b18aa6880b296bbf"
  },
  {
    "url": "brands/toyota.svg",
    "revision": "91bc921dfe46dbeef8b7406e55ff39a2"
  },
  {
    "url": "brands/suzuki.svg",
    "revision": "abdb568b386dca6f54d24d370eec01aa"
  },
  {
    "url": "brands/sokon.svg",
    "revision": "845649aa5cd36942fdeb51f2b3898aa2"
  },
  {
    "url": "brands/skoda.svg",
    "revision": "6f83fb8fbb24bedbfcefa9f61a02f603"
  },
  {
    "url": "brands/seat.svg",
    "revision": "1b57788e2c242045e0bbff989a12f37c"
  },
  {
    "url": "brands/renault.svg",
    "revision": "269dfe6fcd2bdf715c7f56ef6ddceb5a"
  },
  {
    "url": "brands/porsche.svg",
    "revision": "0b879182f89adef0439594757e99c245"
  },
  {
    "url": "brands/peugeot.svg",
    "revision": "9949d369d18ac34ffeaefcb38d9b78b7"
  },
  {
    "url": "brands/opel.svg",
    "revision": "6819a4711134fb9fba0694527aad719b"
  },
  {
    "url": "brands/nissan.svg",
    "revision": "5a8762f277c6f08f6a1a855e0aad7250"
  },
  {
    "url": "brands/mg.svg",
    "revision": "8a8dd7f04710eb0d2aebc85c3fe7fa09"
  },
  {
    "url": "brands/mercedes-benz.svg",
    "revision": "e332a55e863b8711c2749cc8ee04f310"
  },
  {
    "url": "brands/land-rover.svg",
    "revision": "2ed0e620562278e7c7896e21e9fab143"
  },
  {
    "url": "brands/kia.svg",
    "revision": "9bd2aa7abe157d13409ca08e76d3c470"
  },
  {
    "url": "brands/joyear.svg",
    "revision": "eac250aa1c4dbab04d75044af9c980e0"
  },
  {
    "url": "brands/jmc.svg",
    "revision": "9817648e586fb48abd2f053d400c6283"
  },
  {
    "url": "brands/jetour.svg",
    "revision": "e32dd4b4b11b7f778dc5813368210ea9"
  },
  {
    "url": "brands/jeep.svg",
    "revision": "35f4d43594775d211c5eb1dc10fa726d"
  },
  {
    "url": "brands/jac.svg",
    "revision": "909905ea97c2786fc65b500fc0d8af17"
  },
  {
    "url": "brands/hyundai.svg",
    "revision": "0c9cec4c82b64f1788e34455ecfc4970"
  },
  {
    "url": "brands/honda.svg",
    "revision": "04e2499b075c33f17e856f2239bcb918"
  },
  {
    "url": "brands/haval.svg",
    "revision": "bf17f7b20f0b6d440ebe6a5988017aa2"
  },
  {
    "url": "brands/great-wall.svg",
    "revision": "36ea56e0dfaadafc5026f76524564a7a"
  },
  {
    "url": "brands/geely.svg",
    "revision": "65166e6b431d3311fe1737d61d820b4e"
  },
  {
    "url": "brands/ford.svg",
    "revision": "9547194af60add0a9804f70138473fce"
  },
  {
    "url": "brands/fiat.svg",
    "revision": "8a5626a4886e78f988e45da3f3a74554"
  },
  {
    "url": "brands/exeed.svg",
    "revision": "46cdbecbfc65faae517227bee4677396"
  },
  {
    "url": "brands/dongfeng.svg",
    "revision": "11808802cdc168f34bb221b760ba031e"
  },
  {
    "url": "brands/dfsk.svg",
    "revision": "4ad21b794d8af33e9998ff33f7eb3966"
  },
  {
    "url": "brands/dacia.svg",
    "revision": "c07a24b470cb508665a124e197b973e0"
  },
  {
    "url": "brands/citroen.svg",
    "revision": "d62b9844f677ce6844a98d4de1dc4e1d"
  },
  {
    "url": "brands/chevrolet.svg",
    "revision": "a3feae214e4719f4b5a233fa00333901"
  },
  {
    "url": "brands/chery.svg",
    "revision": "370026362a254372f501119ed5a72323"
  },
  {
    "url": "brands/byd.svg",
    "revision": "874e47827fcf1c4c51e3259b84f96f46"
  },
  {
    "url": "brands/bmw.svg",
    "revision": "51b53877cb05cecbaaea960fe3980ee7"
  },
  {
    "url": "brands/bestune.svg",
    "revision": "a6bc1591bfdff471d2910f01c0db3c2c"
  },
  {
    "url": "brands/baic.svg",
    "revision": "7c60d4bd7bb8f071bdbafe0251ec8c3d"
  },
  {
    "url": "brands/audi.svg",
    "revision": "93b184893b705232dbff4d360c0123ad"
  },
  {
    "url": "avatars/avatar-8.svg",
    "revision": "65438fb321d5fabadda0e382efe2a460"
  },
  {
    "url": "avatars/avatar-7.svg",
    "revision": "fec2314431b9afa6fbb1402b08e90e7e"
  },
  {
    "url": "avatars/avatar-6.svg",
    "revision": "989aaa6bb5a89570b85dcaa4ad644232"
  },
  {
    "url": "avatars/avatar-5.svg",
    "revision": "9781f1162f76fb4549caf5854037b81c"
  },
  {
    "url": "avatars/avatar-4.svg",
    "revision": "7430d66ee636b86d991c74d85396c2b1"
  },
  {
    "url": "avatars/avatar-3.svg",
    "revision": "fdf813ae7fd974d94c08afad3803e853"
  },
  {
    "url": "avatars/avatar-2.svg",
    "revision": "220e35d8b05584f7fe724edc4e80c004"
  },
  {
    "url": "avatars/avatar-1.svg",
    "revision": "7125be314f6357dbbeede556568528d0"
  },
  {
    "url": "assets/wilayas-BVN_efXS.js",
    "revision": null
  },
  {
    "url": "assets/vendor-zustand-DPfOVizA.js",
    "revision": null
  },
  {
    "url": "assets/vendor-react-B8ncWvY_.js",
    "revision": null
  },
  {
    "url": "assets/vendor-query-8qPhz0zk.js",
    "revision": null
  },
  {
    "url": "assets/vendor-icons-CsCzbn3o.js",
    "revision": null
  },
  {
    "url": "assets/vendor-i18n-BNlw0ABd.js",
    "revision": null
  },
  {
    "url": "assets/vendor-firebase-storage-VHnSIPm2.js",
    "revision": null
  },
  {
    "url": "assets/vendor-firebase-firestore-D2CrQkzt.js",
    "revision": null
  },
  {
    "url": "assets/vendor-firebase-auth-BEtBEj91.js",
    "revision": null
  },
  {
    "url": "assets/vendor-firebase-app-4EIAdv54.js",
    "revision": null
  },
  {
    "url": "assets/vendor-animations-C6iVO7UL.js",
    "revision": null
  },
  {
    "url": "assets/useProducts-D42uCT2b.js",
    "revision": null
  },
  {
    "url": "assets/ui-P9JZtZaQ.js",
    "revision": null
  },
  {
    "url": "assets/translations-B8Hju2eT.js",
    "revision": null
  },
  {
    "url": "assets/subscription.api-DmV6cz_I.js",
    "revision": null
  },
  {
    "url": "assets/shippingCalculatorService-CsGq10DD.js",
    "revision": null
  },
  {
    "url": "assets/settings.api-mzuhvKwZ.js",
    "revision": null
  },
  {
    "url": "assets/secureCrypto-DTUHJdae.js",
    "revision": null
  },
  {
    "url": "assets/sanitization-B-cVyGS5.js",
    "revision": null
  },
  {
    "url": "assets/rolldown-runtime-B0Z9INg1.js",
    "revision": null
  },
  {
    "url": "assets/realEstateGeolocation-CJsk-K6o.js",
    "revision": null
  },
  {
    "url": "assets/queryKeys-58gx9ibu.js",
    "revision": null
  },
  {
    "url": "assets/purify.es-DYy4WqoL.js",
    "revision": null
  },
  {
    "url": "assets/products.api-DctbaAwx.js",
    "revision": null
  },
  {
    "url": "assets/primitives-DfzpXhKc.js",
    "revision": null
  },
  {
    "url": "assets/phone-DqEXw6H4.js",
    "revision": null
  },
  {
    "url": "assets/masking-BcIkRibS.js",
    "revision": null
  },
  {
    "url": "assets/logger-BejdhPh7.js",
    "revision": null
  },
  {
    "url": "assets/lib-Z3XgV527.js",
    "revision": null
  },
  {
    "url": "assets/lib-DLLAyPk_.js",
    "revision": null
  },
  {
    "url": "assets/jspdf.es.min-Bkz3rfoJ.js",
    "revision": null
  },
  {
    "url": "assets/index.es-C44eaDL1.js",
    "revision": null
  },
  {
    "url": "assets/index-DDYlOE8t.css",
    "revision": null
  },
  {
    "url": "assets/index-BcmCcGqM.js",
    "revision": null
  },
  {
    "url": "assets/iconRegistry-B_RmDozm.js",
    "revision": null
  },
  {
    "url": "assets/html2canvas-XpPErLxs.js",
    "revision": null
  },
  {
    "url": "assets/googleWorkspace-eAckpDjU.js",
    "revision": null
  },
  {
    "url": "assets/fr-Cw32bLkM.js",
    "revision": null
  },
  {
    "url": "assets/format-YD9ULMWQ.js",
    "revision": null
  },
  {
    "url": "assets/firebase-D-KaTDk6.js",
    "revision": null
  },
  {
    "url": "assets/eventemitter3-B-7fnsqn.js",
    "revision": null
  },
  {
    "url": "assets/dist-BvEIXadt.js",
    "revision": null
  },
  {
    "url": "assets/date-kiy-oMHj.js",
    "revision": null
  },
  {
    "url": "assets/csvExport-CEwbEkW1.js",
    "revision": null
  },
  {
    "url": "assets/constants-Ct8nKDp3.js",
    "revision": null
  },
  {
    "url": "assets/clsx-DB0hHKMi.js",
    "revision": null
  },
  {
    "url": "assets/chatRepository-R7mLdH0E.js",
    "revision": null
  },
  {
    "url": "assets/auto.utils-BHPvVm5W.js",
    "revision": null
  },
  {
    "url": "assets/auto.client-B9UPcye2.js",
    "revision": null
  },
  {
    "url": "assets/auto.brands-C4H8dm2y.js",
    "revision": null
  },
  {
    "url": "assets/auth.service-D9QBYkoX.js",
    "revision": null
  },
  {
    "url": "assets/artisanGeo-goV3Mbnf.js",
    "revision": null
  },
  {
    "url": "assets/api-BJFQRJFD.js",
    "revision": null
  },
  {
    "url": "assets/analyticsEngine-OHLyW-vM.js",
    "revision": null
  },
  {
    "url": "assets/algerianCommunesDatabase-HdrtENSP.js",
    "revision": null
  },
  {
    "url": "assets/algeriaRegions-DuZAe2Qt.js",
    "revision": null
  },
  {
    "url": "assets/adminRepository-Beyco6HT.js",
    "revision": null
  },
  {
    "url": "assets/WilayaCommuneSelector-B6P1JDdw.js",
    "revision": null
  },
  {
    "url": "assets/VerifyEmail-DGr7wu59.js",
    "revision": null
  },
  {
    "url": "assets/Verification-Bq5U3Fe6.js",
    "revision": null
  },
  {
    "url": "assets/VehicleDetailPage-B2CXkzNx.js",
    "revision": null
  },
  {
    "url": "assets/VehicleCatalogPage-B-FQ6aze.js",
    "revision": null
  },
  {
    "url": "assets/VehicleCard-CUlGMOGP.js",
    "revision": null
  },
  {
    "url": "assets/UserAffinityAccumulator-Ca2d7k5Z.js",
    "revision": null
  },
  {
    "url": "assets/UniversalFileUploader-D-O6_Y6o.js",
    "revision": null
  },
  {
    "url": "assets/UIContext-p1kOhCul.js",
    "revision": null
  },
  {
    "url": "assets/TrafficChart-owcZVqky.js",
    "revision": null
  },
  {
    "url": "assets/TagCollectionPage-CdurPc0U.js",
    "revision": null
  },
  {
    "url": "assets/SystemHealth-CfLl2wQP.js",
    "revision": null
  },
  {
    "url": "assets/Support-DYMUxRbG.js",
    "revision": null
  },
  {
    "url": "assets/Support-DVB7LGv8.css",
    "revision": null
  },
  {
    "url": "assets/Support-DQc-qNP8.js",
    "revision": null
  },
  {
    "url": "assets/Support-Buqsv6UE.js",
    "revision": null
  },
  {
    "url": "assets/StoreSectionRenderer-BpOPpLSY.js",
    "revision": null
  },
  {
    "url": "assets/StoreProfile-ASC2KTM0.js",
    "revision": null
  },
  {
    "url": "assets/StoreBuilderGate-Bt-LxNow.css",
    "revision": null
  },
  {
    "url": "assets/StoreBuilderGate-BW-9tXje.js",
    "revision": null
  },
  {
    "url": "assets/StatusBadge-D8tbnvYW.js",
    "revision": null
  },
  {
    "url": "assets/SponsoredProductCard-BwavR-kS.js",
    "revision": null
  },
  {
    "url": "assets/ShopsDirectory-C2XOwigQ.js",
    "revision": null
  },
  {
    "url": "assets/ShopSettings-CMhDbYh_.js",
    "revision": null
  },
  {
    "url": "assets/ShopContext-BBV1_1w3.js",
    "revision": null
  },
  {
    "url": "assets/Shop-CVkrdkIG.js",
    "revision": null
  },
  {
    "url": "assets/ShippingLabelPrinter-DLrCHzBL.js",
    "revision": null
  },
  {
    "url": "assets/ShippingCalculatorPage-Dls1ti7e.js",
    "revision": null
  },
  {
    "url": "assets/SellerShipping-CgIXZSti.js",
    "revision": null
  },
  {
    "url": "assets/SellerOnboarding-BTmRX4-0.js",
    "revision": null
  },
  {
    "url": "assets/SellerModeration-CmC4q1g8.js",
    "revision": null
  },
  {
    "url": "assets/SellerGaragePage-CPS00G_r.js",
    "revision": null
  },
  {
    "url": "assets/SellerCoupons-CKZaCr4n.js",
    "revision": null
  },
  {
    "url": "assets/SellerCouponModal-BNR2N2Bd.js",
    "revision": null
  },
  {
    "url": "assets/SellerCouponBanner-DfJWfvPO.js",
    "revision": null
  },
  {
    "url": "assets/SellerAnalytics-EfQH1Sdx.js",
    "revision": null
  },
  {
    "url": "assets/Reviews-Cah8pn2r.js",
    "revision": null
  },
  {
    "url": "assets/ReturnManagement-TBknUURn.js",
    "revision": null
  },
  {
    "url": "assets/RefundPolicy-Dp5uJFiq.js",
    "revision": null
  },
  {
    "url": "assets/QuoteRequestModal-CvxycAkl.js",
    "revision": null
  },
  {
    "url": "assets/PropertyFavoriteButton-D1_UaWaV.js",
    "revision": null
  },
  {
    "url": "assets/PropertyEditor-CoxAeIV1.js",
    "revision": null
  },
  {
    "url": "assets/PropertyDetail-CJcpkBMg.js",
    "revision": null
  },
  {
    "url": "assets/PropertyCard-BsU6LU13.js",
    "revision": null
  },
  {
    "url": "assets/ProductModeration-DPSs12UE.js",
    "revision": null
  },
  {
    "url": "assets/ProductFilterPage-DK6qMcns.js",
    "revision": null
  },
  {
    "url": "assets/ProductDetails-CRI6NHmp.js",
    "revision": null
  },
  {
    "url": "assets/ProductCard-DrLyjpE4.js",
    "revision": null
  },
  {
    "url": "assets/PrivacyPolicy-Cv2dWXIE.js",
    "revision": null
  },
  {
    "url": "assets/PremiumLayout-BN-NDhDc.js",
    "revision": null
  },
  {
    "url": "assets/PremiumCollection-iL8DXQYB.js",
    "revision": null
  },
  {
    "url": "assets/OverviewChart-BNgt0uFT.js",
    "revision": null
  },
  {
    "url": "assets/Overview-CUgsispg.js",
    "revision": null
  },
  {
    "url": "assets/Overview-CBdP1wYG.js",
    "revision": null
  },
  {
    "url": "assets/Orders-CIldlYYl.js",
    "revision": null
  },
  {
    "url": "assets/OrderDetails-eUmIIXm0.js",
    "revision": null
  },
  {
    "url": "assets/OptimizedImage-AVEPEVMT.js",
    "revision": null
  },
  {
    "url": "assets/Onboarding-C_yyxlkX.js",
    "revision": null
  },
  {
    "url": "assets/OlmaLanguageSelector-dZ23yo-5.js",
    "revision": null
  },
  {
    "url": "assets/OlmaImmoProfile-Dgfd54w4.js",
    "revision": null
  },
  {
    "url": "assets/OlmaImmoHome-BfM0SFZN.js",
    "revision": null
  },
  {
    "url": "assets/NotFound-S1IgUOxI.js",
    "revision": null
  },
  {
    "url": "assets/Newsletter-BOmbCV98.js",
    "revision": null
  },
  {
    "url": "assets/MyBookings-C3ej_Z1S.js",
    "revision": null
  },
  {
    "url": "assets/MobileCategories-CVIGTh2m.js",
    "revision": null
  },
  {
    "url": "assets/MegaMenuSettings-CAlgVAp2.js",
    "revision": null
  },
  {
    "url": "assets/MegaMenuContext-B7lC2vH7.js",
    "revision": null
  },
  {
    "url": "assets/MarketingCenter-DrxyXa2p.js",
    "revision": null
  },
  {
    "url": "assets/Marketing-DsrOn1vR.js",
    "revision": null
  },
  {
    "url": "assets/MapTileGrid-DdbOd0-R.js",
    "revision": null
  },
  {
    "url": "assets/ListingWizardStep1-BZJRdM6F.js",
    "revision": null
  },
  {
    "url": "assets/HomepageBuilder-Dj1196AP.js",
    "revision": null
  },
  {
    "url": "assets/Home-CRqyhr08.js",
    "revision": null
  },
  {
    "url": "assets/ForgotPassword-BZj686bM.js",
    "revision": null
  },
  {
    "url": "assets/FeaturedProducts-BjfzaSlb.js",
    "revision": null
  },
  {
    "url": "assets/DynamicCollectionPage-C6icEAgA.js",
    "revision": null
  },
  {
    "url": "assets/Disputes-DLdjiUXV.js",
    "revision": null
  },
  {
    "url": "assets/DisputeManagement-B-ZHqfKT.js",
    "revision": null
  },
  {
    "url": "assets/DisputeChat-BfF1x9fE.js",
    "revision": null
  },
  {
    "url": "assets/Curation-BZQAFIk1.js",
    "revision": null
  },
  {
    "url": "assets/CreateVehicleListingPage-cS334bzy.js",
    "revision": null
  },
  {
    "url": "assets/ComparatorPage-BOZp37zr.js",
    "revision": null
  },
  {
    "url": "assets/ClientArtisanQuotesPage-D1JrYzfF.js",
    "revision": null
  },
  {
    "url": "assets/Checkout-zlfQmiFK.js",
    "revision": null
  },
  {
    "url": "assets/Categories-DffAe2Oy.js",
    "revision": null
  },
  {
    "url": "assets/Catalog-CpxBMslt.js",
    "revision": null
  },
  {
    "url": "assets/CartesianChart-KwcO4U8v.js",
    "revision": null
  },
  {
    "url": "assets/CartContext-2wHkGF3J.js",
    "revision": null
  },
  {
    "url": "assets/Cart-Bk68Jhuj.js",
    "revision": null
  },
  {
    "url": "assets/CampaignPage-DaPRnHWM.js",
    "revision": null
  },
  {
    "url": "assets/CampaignCollection-DZ555dX4.js",
    "revision": null
  },
  {
    "url": "assets/Button-B4EBmA7x.js",
    "revision": null
  },
  {
    "url": "assets/Breadcrumbs-C5YnmcnI.js",
    "revision": null
  },
  {
    "url": "assets/AutoPartsPage-BYGjzo0Z.js",
    "revision": null
  },
  {
    "url": "assets/AutoPartDetailPage-CgARH29z.js",
    "revision": null
  },
  {
    "url": "assets/AutoHome-0iCHp36q.js",
    "revision": null
  },
  {
    "url": "assets/AutoEstimationPage-B6a96SHz.js",
    "revision": null
  },
  {
    "url": "assets/AutoComparePage-DPxHQ8N4.js",
    "revision": null
  },
  {
    "url": "assets/AuthContext-86yrPJAY.js",
    "revision": null
  },
  {
    "url": "assets/Auth-Caiof2_n.js",
    "revision": null
  },
  {
    "url": "assets/ArtisansHome-BhULEHqa.js",
    "revision": null
  },
  {
    "url": "assets/ArtisanNavbar-C-cZs10x.js",
    "revision": null
  },
  {
    "url": "assets/ArtisanDetailPage-B9uUBdrl.js",
    "revision": null
  },
  {
    "url": "assets/ArtisanCategoryBookingGrid-4F7eMdXC.js",
    "revision": null
  },
  {
    "url": "assets/ArtisanBroadcastsPage-BZwbFuRA.js",
    "revision": null
  },
  {
    "url": "assets/ArtisanApplyPage--Ahp5BYe.js",
    "revision": null
  },
  {
    "url": "assets/AreaChart-DMV7W2GS.js",
    "revision": null
  },
  {
    "url": "logo.svg",
    "revision": "a4ddf3647695790ba247a70ad88021af"
  },
  {
    "url": "manifest.webmanifest",
    "revision": "4b14ea3ec84882c85829008728040c0c"
  }
], {});
workbox_precaching_cleanupOutdatedCaches();workbox_routing_registerRoute(new workbox_routing_NavigationRoute(workbox_precaching_createHandlerBoundToURL("index.html")));
workbox_routing_registerRoute(/^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\/.*/i, new workbox_strategies_CacheFirst({ "cacheName":"google-fonts-cache", plugins: [new workbox_expiration_ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 31536000 }), new workbox_cacheable_response_CacheableResponsePlugin({ statuses: [ 0, 200 ] })] }), 'GET');
workbox_routing_registerRoute(/\.(?:png|gif|jpg|jpeg|webp|svg|avif)$/i, new workbox_strategies_StaleWhileRevalidate({ "cacheName":"assets-images-cache", plugins: [new workbox_expiration_ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 2592000 })] }), 'GET');
workbox_routing_registerRoute(/\/api\/v1\/public\//i, new workbox_strategies_NetworkFirst({ "cacheName":"api-public-cache","networkTimeoutSeconds":5, plugins: [new workbox_expiration_ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 300 }), new workbox_cacheable_response_CacheableResponsePlugin({ statuses: [ 0, 200 ] })] }), 'GET');
workbox_routing_registerRoute(/\/locales\/.*\.json/, new workbox_strategies_NetworkFirst({ "cacheName":"locales-cache", plugins: [new workbox_expiration_ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 86400 }), new workbox_cacheable_response_CacheableResponsePlugin({ statuses: [ 0, 200 ] })] }), 'GET');



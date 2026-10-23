import React from "react";
import { Route, Navigate } from "react-router-dom";
import { PageWrapper } from "../components/common/PageWrapper";
import { lazyWithRetry } from "../utils/lazyWithRetry";

// Artisans & Bricolage Pages
const ArtisansHome = lazyWithRetry(() => import("../pages/Artisans/ArtisansHome"), "ArtisansHome");
const ArtisanDetailPage = lazyWithRetry(() => import("../pages/Artisans/ArtisanDetailPage"), "ArtisanDetailPage");
const ArtisanApplyPage = lazyWithRetry(() => import("../pages/Artisans/ArtisanApplyPage"), "ArtisanApplyPage");
const ArtisanDashboardPage = lazyWithRetry(() => import("../pages/Artisans/ArtisanDashboardPage"), "ArtisanDashboardPage");
const ClientArtisanQuotesPage = lazyWithRetry(() => import("../pages/Artisans/ClientArtisanQuotesPage"), "ClientArtisanQuotesPage");
const ArtisanBroadcastsPage = lazyWithRetry(() => import("../pages/Artisans/ArtisanBroadcastsPage"), "ArtisanBroadcastsPage");

// Olma Immo Pages
const OlmaImmoHome = lazyWithRetry(() => import("../pages/OlmaImmo/OlmaImmoHome"), "OlmaImmoHome");
const PropertyDetail = lazyWithRetry(() => import("../pages/OlmaImmo/PropertyDetail"), "PropertyDetail");
const PropertyOwnerDashboard = lazyWithRetry(() => import("../pages/OlmaImmo/PropertyOwnerDashboard"), "PropertyOwnerDashboard");
const PropertyEditor = lazyWithRetry(() => import("../pages/OlmaImmo/PropertyEditor"), "PropertyEditor");
const MyBookings = lazyWithRetry(() => import("../pages/OlmaImmo/MyBookings"), "MyBookings");
const OlmaImmoProfile = lazyWithRetry(() => import("../pages/OlmaImmo/OlmaImmoProfile"), "OlmaImmoProfile");

// Olma Auto Pages
const AutoHome = lazyWithRetry(() => import("../pages/Auto/AutoHome"), "AutoHome");
const VehicleCatalogPage = lazyWithRetry(() => import("../pages/Auto/VehicleCatalogPage"), "VehicleCatalogPage");
const VehicleDetailPage = lazyWithRetry(() => import("../pages/Auto/VehicleDetailPage"), "VehicleDetailPage");
const CreateVehicleListingPage = lazyWithRetry(() => import("../pages/Auto/CreateVehicleListingPage"), "CreateVehicleListingPage");
const SellerGaragePage = lazyWithRetry(() => import("../pages/Auto/SellerGaragePage"), "SellerGaragePage");
const AutoPartsPage = lazyWithRetry(() => import("../pages/Auto/AutoPartsPage"), "AutoPartsPage");
const AutoPartDetailPage = lazyWithRetry(() => import("../pages/Auto/AutoPartDetailPage"), "AutoPartDetailPage");
const AutoEstimationPage = lazyWithRetry(() => import("../pages/Auto/AutoEstimationPage"), "AutoEstimationPage");
const AutoComparePage = lazyWithRetry(() => import("../pages/Auto/AutoComparePage"), "AutoComparePage");

export const renderEcosystemRoutes = () => (
  <>
    {/* Olma Auto Ecosystem Routes */}
    <Route path="/auto" element={<PageWrapper><AutoHome /></PageWrapper>} />
    <Route path="/auto/catalog" element={<PageWrapper><VehicleCatalogPage /></PageWrapper>} />
    <Route path="/auto/vehicules" element={<PageWrapper><VehicleCatalogPage /></PageWrapper>} />
    <Route path="/auto/vehicules/:id" element={<PageWrapper><VehicleDetailPage /></PageWrapper>} />
    <Route path="/auto/deposer" element={<PageWrapper><CreateVehicleListingPage /></PageWrapper>} />
    <Route path="/auto/mon-garage" element={<PageWrapper><SellerGaragePage /></PageWrapper>} />
    <Route path="/dashboard/seller/auto" element={<PageWrapper><SellerGaragePage /></PageWrapper>} />

    {/* Outils & Services Majeurs Olma Auto */}
    <Route path="/auto/estimation" element={<PageWrapper><AutoEstimationPage /></PageWrapper>} />
    <Route path="/auto/argus" element={<PageWrapper><AutoEstimationPage /></PageWrapper>} />
    <Route path="/auto/comparer" element={<PageWrapper><AutoComparePage /></PageWrapper>} />
    <Route path="/auto/compare" element={<PageWrapper><AutoComparePage /></PageWrapper>} />
    <Route path="/auto/favoris" element={<PageWrapper><VehicleCatalogPage /></PageWrapper>} />

    {/* Pièces Détachées & Casse Automobile (Phase 4) */}
    <Route path="/auto/pieces" element={<PageWrapper><AutoPartsPage /></PageWrapper>} />
    <Route path="/auto/pieces/:id" element={<PageWrapper><AutoPartDetailPage /></PageWrapper>} />
    <Route path="/auto/parts" element={<PageWrapper><AutoPartsPage /></PageWrapper>} />
    <Route path="/auto/parts/:id" element={<PageWrapper><AutoPartDetailPage /></PageWrapper>} />

    {/* Artisans Ecosystem Routes */}
    <Route path="/bricolage" element={<PageWrapper><ArtisansHome /></PageWrapper>} />
    <Route path="/artisans" element={<PageWrapper><ArtisansHome /></PageWrapper>} />
    <Route path="/artisans/profile/:id" element={<PageWrapper><ArtisanDetailPage /></PageWrapper>} />
    <Route path="/artisans/devenir-artisan" element={<PageWrapper><ArtisanApplyPage /></PageWrapper>} />
    <Route path="/artisans/dashboard" element={<PageWrapper><ArtisanDashboardPage /></PageWrapper>} />
    <Route path="/artisans/mes-demandes" element={<PageWrapper><ClientArtisanQuotesPage /></PageWrapper>} />
    <Route path="/artisans/annonces" element={<PageWrapper><ArtisanBroadcastsPage /></PageWrapper>} />
    <Route path="/bricolage/profile" element={<Navigate to="/artisans/dashboard" replace />} />
    <Route path="/services/bricolage" element={<Navigate to="/artisans" replace />} />

    {/* Olma Immo & Location Routes */}
    <Route path="/immo" element={<PageWrapper><OlmaImmoHome /></PageWrapper>} />
    <Route path="/immo/property/:id" element={<PageWrapper><PropertyDetail /></PageWrapper>} />
    <Route path="/immo/owner" element={<PageWrapper><PropertyOwnerDashboard /></PageWrapper>} />
    <Route path="/immo/publish" element={<PageWrapper><PropertyEditor /></PageWrapper>} />
    <Route path="/immo/edit/:id" element={<PageWrapper><PropertyEditor /></PageWrapper>} />
    <Route path="/immo/my-bookings" element={<PageWrapper><MyBookings /></PageWrapper>} />
    <Route path="/immo/profile" element={<PageWrapper><OlmaImmoProfile /></PageWrapper>} />
  </>
);

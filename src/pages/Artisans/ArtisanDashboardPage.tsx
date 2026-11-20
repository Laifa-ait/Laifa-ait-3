import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchMyArtisanProfile,
  fetchArtisanMyQuotes,
  fetchArtisanTrades,
  updateArtisanMyProfile,
} from "../../services/artisan.api";
import { fetchMyArtisanOffers } from "../../services/artisanOffers.api";
import { ArtisanProfile, ArtisanQuoteRequest, ArtisanTrade } from "../../types/artisan";
import { ArtisanOffer } from "../../types/artisanOffers";
import {
  ArtisanDashboardLayout,
  ArtisanDashboardTab,
} from "../../components/artisans/dashboard/ArtisanDashboardLayout";
import { ArtisanOverviewTab } from "../../components/artisans/dashboard/ArtisanOverviewTab";
import { ArtisanOffersTab } from "../../components/artisans/dashboard/ArtisanOffersTab";
import { ArtisanOfferForm } from "../../components/artisans/dashboard/ArtisanOfferForm";
import { ArtisanQuotesTab } from "../../components/artisans/dashboard/ArtisanQuotesTab";
import { ArtisanAdsCampaignTab } from "../../components/artisans/dashboard/ArtisanAdsCampaignTab";
import { ArtisanSettingsTab } from "../../components/artisans/dashboard/ArtisanSettingsTab";
import { ArtisanIntegratedInbox } from "../../components/artisans/messaging/ArtisanIntegratedInbox";

export const ArtisanDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ArtisanProfile | null>(null);
  const [offers, setOffers] = useState<ArtisanOffer[]>([]);
  const [quotes, setQuotes] = useState<ArtisanQuoteRequest[]>([]);
  const [trades, setTrades] = useState<ArtisanTrade[]>([]);
  const [activeTab, setActiveTab] = useState<ArtisanDashboardTab>("overview");
  const [editingOffer, setEditingOffer] = useState<ArtisanOffer | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const myProf = await fetchMyArtisanProfile();
      if (!myProf) {
        navigate("/artisans/devenir-artisan", { replace: true });
        return;
      }
      setProfile(myProf);

      const [myOffers, myQuotes, tradesList] = await Promise.all([
        fetchMyArtisanOffers(),
        fetchArtisanMyQuotes(),
        fetchArtisanTrades(),
      ]);
      setOffers(myOffers);
      setQuotes(myQuotes);
      setTrades(tradesList);
    } finally {
      setLoading(false);
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      navigate("/auth?redirect=/artisans/dashboard");
      return;
    }
    loadData();
  }, [currentUser, authLoading, loadData, navigate]);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    setUpdatingAvailability(true);
    try {
      const nextVal = !profile.isAvailable;
      await updateArtisanMyProfile({ isAvailable: nextVal });
      setProfile({ ...profile, isAvailable: nextVal });
    } finally {
      setUpdatingAvailability(false);
    }
  };

  if ((loading || authLoading) && !profile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  if (!profile) return null;

  const pendingQuotesCount = quotes.filter((q) => q.status === "pending").length;

  return (
    <ArtisanDashboardLayout
      profile={profile}
      activeTab={activeTab}
      onSelectTab={(tab) => {
        if (tab === "publish" && activeTab !== "publish") {
          setEditingOffer(null);
        }
        setActiveTab(tab);
      }}
      offersCount={offers.length}
      pendingQuotesCount={pendingQuotesCount}
      updatingAvailability={updatingAvailability}
      onToggleAvailability={handleToggleAvailability}
    >
      {activeTab === "overview" && (
        <ArtisanOverviewTab
          profile={profile}
          offers={offers}
          quotes={quotes}
          onNavigateTab={(tab) => {
            if (tab === "publish") setEditingOffer(null);
            setActiveTab(tab);
          }}
        />
      )}

      {activeTab === "offers" && (
        <ArtisanOffersTab
          offers={offers}
          onCreateNew={() => {
            setEditingOffer(null);
            setActiveTab("publish");
          }}
          onEditOffer={(offer) => {
            setEditingOffer(offer);
            setActiveTab("publish");
          }}
          onRefresh={loadData}
        />
      )}

      {activeTab === "publish" && (
        <ArtisanOfferForm
          profile={profile}
          trades={trades}
          editingOffer={editingOffer}
          onSaved={async () => {
            setEditingOffer(null);
            await loadData();
            setActiveTab("offers");
          }}
          onCancel={() => {
            setEditingOffer(null);
            setActiveTab("offers");
          }}
        />
      )}

      {activeTab === "quotes" && (
        <ArtisanQuotesTab
          quotes={quotes}
          onRefreshQuotes={loadData}
          onOpenChat={(convId) => {
            if (convId) setSelectedConversationId(convId);
            setActiveTab("messages");
          }}
        />
      )}

      {activeTab === "messages" && (
        <ArtisanIntegratedInbox
          initialConversationId={selectedConversationId}
          emptySubtitle="Les discussions avec vos clients suite aux demandes de devis s'affichent ici."
        />
      )}

      {activeTab === "ads" && <ArtisanAdsCampaignTab profile={profile} />}

      {activeTab === "settings" && (
        <ArtisanSettingsTab profile={profile} onProfileUpdated={loadData} />
      )}
    </ArtisanDashboardLayout>
  );
};

export default ArtisanDashboardPage;

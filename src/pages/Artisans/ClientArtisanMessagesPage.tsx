import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, MessageSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { OlmaArtisanShell } from "../../components/artisans/shell/OlmaArtisanShell";
import { ArtisanIntegratedInbox } from "../../components/artisans/messaging/ArtisanIntegratedInbox";

export const ClientArtisanMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, loading } = useAuth();
  const initialConversationId = searchParams.get("conversationId");

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/auth?redirect=/artisans/messages");
    }
  }, [currentUser, loading, navigate]);

  return (
    <OlmaArtisanShell activeTab="messages">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20 space-y-5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => navigate("/artisans")}
            className="hover:text-[#0F172A] inline-flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Catalogue d&apos;offres</span>
          </button>
          <span>/</span>
          <span className="font-semibold text-[#0F172A]">Messagerie Devis</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0F172A]">Messagerie avec vos artisans</h1>
            <p className="text-xs text-slate-500">
              Discutez de vos devis, précisez vos besoins et convenez d&apos;une date d&apos;intervention.
            </p>
          </div>
        </div>

        <ArtisanIntegratedInbox
          initialConversationId={initialConversationId}
          emptySubtitle="Envoyez une demande de devis depuis une offre de travaux pour démarrer une discussion directe avec l'artisan."
        />
      </div>
    </OlmaArtisanShell>
  );
};

export default ClientArtisanMessagesPage;

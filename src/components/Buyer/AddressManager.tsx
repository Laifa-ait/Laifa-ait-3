import React, { useState, useEffect } from "react";
import { MapPin, Plus, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { apiPost } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { UserProfile, UserAddress, AuthUser as FirebaseUser } from "../../domains/user/user.types";
import { AddressCardItem } from "./AddressCardItem";
import { AddressFormModal } from "./AddressFormModal";

interface AddressManagerProps {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
}

export const AddressManager: React.FC<AddressManagerProps> = ({ currentUser, userProfile }) => {
  const { t } = useTranslation();
  const { updateUserProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>(userProfile?.shippingAddresses || []);

  useEffect(() => {
    if (Array.isArray(userProfile?.shippingAddresses)) {
      setAddresses(userProfile.shippingAddresses);
    }
  }, [userProfile?.shippingAddresses]);

  const handleSaveAddress = async (addressData: UserAddress) => {
    try {
      let updatedAddresses: UserAddress[];
      const isExisting = addresses.some((a) => a.id === addressData.id);

      if (isExisting) {
        updatedAddresses = addresses.map((a) => {
          if (a.id === addressData.id) return addressData;
          if (addressData.isDefault) return { ...a, isDefault: false };
          return a;
        });
      } else {
        const isFirst = addresses.length === 0;
        const newAddr = { ...addressData, isDefault: addressData.isDefault || isFirst };
        updatedAddresses = newAddr.isDefault
          ? [...addresses.map((a) => ({ ...a, isDefault: false })), newAddr]
          : [...addresses, newAddr];
      }

      await apiPost("/api/v1/auth/profile", {
        shippingAddresses: updatedAddresses,
      });

      setAddresses(updatedAddresses);
      await updateUserProfile();
      toast.success(t("Adresse de livraison enregistrée avec succès !"));
      setIsModalOpen(false);
      setEditingAddress(null);
    } catch (err: unknown) {
      console.error("Save address failed:", err);
      toast.error(t("Impossible d'enregistrer l'adresse."));
      throw err;
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const updated = addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      await apiPost("/api/v1/auth/profile", { shippingAddresses: updated });
      setAddresses(updated);
      await updateUserProfile();
      toast.success(t("Adresse par défaut mise à jour."));
    } catch (err) {
      console.error("Set default failed:", err);
      toast.error(t("Erreur lors de la mise à jour."));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const addressToDelete = addresses.find((a) => a.id === id);
      let updated = addresses.filter((a) => a.id !== id);
      if (addressToDelete?.isDefault && updated.length > 0) {
        updated = updated.map((a, idx) => (idx === 0 ? { ...a, isDefault: true } : a));
      }
      await apiPost("/api/v1/auth/profile", { shippingAddresses: updated });
      setAddresses(updated);
      await updateUserProfile();
      toast.success(t("Adresse supprimée."));
    } catch (err) {
      console.error("Delete address failed:", err);
      toast.error(t("Erreur lors de la suppression."));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="address-manager-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1836] tracking-tight">
            {t("Adresses et livraisons (69 Wilayas)")}
          </h2>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1">
            {t("Gérez vos adresses de livraison à domicile et Stop Desk en Algérie.")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingAddress(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1A1836] to-[#622347] hover:brightness-110 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer border-none"
        >
          <Plus className="w-4 h-4 text-[#E99856]" />
          <span>{t("Ajouter une adresse")}</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-[#1A1836] via-[#42164B] to-[#622347] border border-[#A54055]/30 rounded-3xl p-5 flex items-start gap-4 text-white shadow-md">
        <div className="w-10 h-10 rounded-xl bg-[#E99856]/20 text-[#E99856] flex items-center justify-center shrink-0 border border-[#E99856]/30">
          <Truck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-[#E99856]">{t("Livraison directe dans les 69 Wilayas")}</h4>
          <p className="text-xs text-[#E0B4B2] leading-relaxed">
            {t(
              "Vos adresses enregistrées sont utilisées pour pré-remplir le tunnel de commande (COD) et calculer automatiquement les tarifs d'expédition à domicile ou en point relais."
            )}
          </p>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white border border-[#E0B4B2]/40 rounded-3xl p-10 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF7F8] text-[#A54055] flex items-center justify-center mx-auto border border-[#E0B4B2]/40">
            <MapPin className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-extrabold text-[#1A1836]">
              {t("Aucune adresse enregistrée")}
            </h3>
            <p className="text-xs text-zinc-500">
              {t("Ajoutez votre première adresse pour commander plus rapidement sur Olmart.")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingAddress(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#E99856] to-[#d8823e] text-[#1A1836] text-xs font-extrabold rounded-xl transition-all cursor-pointer border-none shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t("Ajouter une adresse")}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCardItem
              key={addr.id}
              address={addr}
              onSetDefault={handleSetDefault}
              onEdit={(a) => {
                setEditingAddress(a);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AddressFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        initialAddress={editingAddress}
        defaultName={userProfile?.displayName || currentUser?.displayName || ""}
      />
    </div>
  );
};

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { AuthUser as User, UserProfile } from "../../domains/user/user.types";
import { apiPost } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { PasswordChangeModal } from "./security/PasswordChangeModal";
import { SecurityCards } from "./security/SecurityCards";
import { ProfileEditDialog, ProfileEditField } from "./ProfileEditDialog";
import { TwoFactorSecurityModal } from "../Security/TwoFactorSecurityModal";

interface SecuritySettingsProps {
  currentUser: User | null;
  userProfile?: UserProfile | null;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ currentUser, userProfile = null }) => {
  const { t } = useTranslation();
  const { updateUserProfile } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [activeProfileField, setActiveProfileField] = useState<ProfileEditField | null>(null);

  const handleSaveContactField = async (data: Record<string, string>) => {
    try {
      await apiPost("/api/v1/auth/profile", data);
      await updateUserProfile();
      toast.success(t("Informations de sécurité mises à jour avec succès."));
    } catch (err: unknown) {
      console.error("Failed to update contact:", err);
      toast.error(t("Erreur lors de la mise à jour des coordonnées."));
      throw err;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto" id="security-settings-module">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1836] tracking-tight">
          {t("Confidentialité et sécurité")}
        </h2>
        <p className="text-zinc-500 text-xs sm:text-sm mt-1">
          {t("Paramètres et recommandations pour renforcer la protection de votre compte Olmart.")}
        </p>
      </div>

      <SecurityCards
        currentUser={currentUser}
        userProfile={userProfile}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
        onOpen2FAModal={() => setIs2FAModalOpen(true)}
        onOpenEmailModal={() => toast(t("L'adresse email est votre identifiant principal Firebase vérifié."))}
        onOpenPhoneModal={() => setActiveProfileField("phone")}
      />

      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userEmail={currentUser?.email || null}
      />

      <TwoFactorSecurityModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        userEmail={currentUser?.email || undefined}
        isInitiallyEnabled={Boolean(userProfile?.twoFactorEnabled)}
        onStatusChange={() => {
          updateUserProfile();
        }}
      />

      <ProfileEditDialog
        field={activeProfileField}
        onClose={() => setActiveProfileField(null)}
        onSave={handleSaveContactField}
        initialData={{
          name: userProfile?.displayName || currentUser?.displayName || "",
          nickname: (userProfile?.nickname as string) || "",
          birthDate: (userProfile?.birthDate as string) || "",
          gender: (userProfile?.gender as string) || "unspecified",
          phone: userProfile?.phone || (currentUser?.phoneNumber as string) || "",
          photoURL: userProfile?.photoURL || currentUser?.photoURL || "",
          bio: (userProfile?.bio as string) || "",
        }}
      />
    </div>
  );
};

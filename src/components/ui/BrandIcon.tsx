import React from "react";
import type { IconType } from "@icons-pack/react-simple-icons";
import SiFacebook from "@icons-pack/react-simple-icons/icons/SiFacebook";
import SiInstagram from "@icons-pack/react-simple-icons/icons/SiInstagram";
import SiTiktok from "@icons-pack/react-simple-icons/icons/SiTiktok";
import SiYoutube from "@icons-pack/react-simple-icons/icons/SiYoutube";
import SiX from "@icons-pack/react-simple-icons/icons/SiX";
import SiWhatsapp from "@icons-pack/react-simple-icons/icons/SiWhatsapp";
import SiTelegram from "@icons-pack/react-simple-icons/icons/SiTelegram";
import SiGithub from "@icons-pack/react-simple-icons/icons/SiGithub";
import SiGoogle from "@icons-pack/react-simple-icons/icons/SiGoogle";
import SiVisa from "@icons-pack/react-simple-icons/icons/SiVisa";
import SiMastercard from "@icons-pack/react-simple-icons/icons/SiMastercard";
import SiApplepay from "@icons-pack/react-simple-icons/icons/SiApplepay";
import SiGooglepay from "@icons-pack/react-simple-icons/icons/SiGooglepay";

export type BrandIconName =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "x"
  | "twitter"
  | "whatsapp"
  | "telegram"
  | "github"
  | "google"
  | "visa"
  | "mastercard"
  | "applepay"
  | "googlepay";

const BRAND_ICONS_MAP: Record<Exclude<BrandIconName, "linkedin">, IconType> = {
  facebook: SiFacebook,
  instagram: SiInstagram,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  x: SiX,
  twitter: SiX,
  whatsapp: SiWhatsapp,
  telegram: SiTelegram,
  github: SiGithub,
  google: SiGoogle,
  visa: SiVisa,
  mastercard: SiMastercard,
  applepay: SiApplepay,
  googlepay: SiGooglepay
};

export interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  name: BrandIconName;
  size?: number | string;
  className?: string;
  color?: string;
}

/**
 * Composant BrandIcon pour le rendu léger et tree-shakeable des logos officiels
 */
export const BrandIcon: React.FC<BrandIconProps> = ({
  name,
  size = 20,
  className = "",
  color = "currentColor",
  ...props
}) => {
  const normalizedName = name.toLowerCase() as BrandIconName;

  if (normalizedName === "linkedin") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    );
  }

  const IconComponent = BRAND_ICONS_MAP[normalizedName as keyof typeof BRAND_ICONS_MAP];

  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      {...props}
    />
  );
};



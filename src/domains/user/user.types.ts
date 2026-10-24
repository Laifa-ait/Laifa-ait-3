export {
  userProfileSchema,
  buyerProfileSchema,
  vendorProfileSchema,
  adminProfileSchema
} from "./user.schema";

import type { UserProfile as ZodUserProfile } from "./user.schema";

export interface UserAddress {
  id: string;
  wilaya: string;
  daira?: string;
  commune: string;
  codePostal?: string;
  rue?: string;
  street?: string;
  phone: string;
  isDefault: boolean;
  name?: string;
  isShipping?: boolean;
  isBilling?: boolean;
}

// Alias to maintain compatibility during migration
export type UserProfile = ZodUserProfile & {
  shippingAddresses?: UserAddress[];
  preferences?: {
    interests?: string[];
    [key: string]: unknown;
  };
  name?: string;
  rcNumber?: string;
  nifNumber?: string;
  rib?: string;
  isVelocitySuspended?: boolean;
  shopName?: string;
  commissionRate?: number;
  status?: string;
  verificationStatus?: string;
  bio?: string;
  interests?: string[];
  phoneNumber?: string | null;
  capabilities?: string[];
  sellerOnboardingCompleted?: boolean;
  shopSlug?: string;
};

export { ROLES } from "../../constants/roles";
export type { UserRole } from "../../constants/roles";


export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber?: string | null;
  isAnonymous?: boolean;
  tenantId?: string | null;
}

export type User = UserProfile;

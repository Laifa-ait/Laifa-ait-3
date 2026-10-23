export const ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ARTISAN: 'artisan',
  PROPERTY_OWNER: 'property_owner',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];
export const ALL_ROLES = Object.values(ROLES) as UserRole[];

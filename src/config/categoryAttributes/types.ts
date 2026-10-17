/**
 * OLMART CATEGORY ATTRIBUTES ENGINE - TYPES
 * Types stricts pour les spécifications, filtres et matières 100% contextuels.
 */

export interface AttributeOption {
  value: string;
  label: string;
}

export interface ContextualAttribute {
  id: string;
  label: string;
  type: "select" | "radio" | "multiselect" | "text" | "number";
  options?: AttributeOption[] | string[];
  unit?: string;
  placeholder?: string;
  help?: string;
}

export interface AttributeGroup {
  id: string;
  title: string;
  iconName?: string;
  description?: string;
  attributes: ContextualAttribute[];
}

export interface MaterialOption {
  id: string;
  label: string;
  categoryGroup?: string;
}

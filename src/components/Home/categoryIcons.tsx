import React from "react";
import { Baby, LucideProps } from "lucide-react";

// High-fidelity line-art vector icons inspired by Flaticon style
export const ArmchairIcon: React.FC<LucideProps> = ({ className = "w-12 h-12", ...props }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Modern Armchair matching the reference screenshot */}
    {/* Backrest */}
    <path d="M12 24V14C12 9.58 15.58 6 20 6H28C32.42 6 36 9.58 36 14V24" />
    {/* Cushioned back inner lines */}
    <path d="M20 10V22" strokeOpacity="0.4" />
    <path d="M28 10V22" strokeOpacity="0.4" />
    {/* Left Armrest */}
    <path d="M8 20H12C13.66 20 15 21.34 15 23V30H8C6.34 30 5 28.66 5 27V23C5 21.34 6.34 20 8 20Z" />
    {/* Right Armrest */}
    <path d="M36 20H40C41.66 20 43 21.34 43 23V27C43 28.66 41.66 30 40 30H33V23C33 21.34 34.34 20 36 20Z" />
    {/* Seat Cushion */}
    <path d="M15 25H33V30C33 31.66 31.66 33 30 33H18C16.34 33 15 31.66 15 30V25Z" />
    {/* Base frame */}
    <path d="M10 33H38" />
    {/* Angled wooden legs */}
    <path d="M14 33L10 42" />
    <path d="M34 33L38 42" />
    <path d="M21 33V38" strokeOpacity="0.5" />
    <path d="M27 33V38" strokeOpacity="0.5" />
  </svg>
);

export const TechDevicesIcon: React.FC<LucideProps> = ({ className = "w-12 h-12", ...props }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Laptop */}
    <rect x="6" y="12" width="26" height="18" rx="2" />
    <path d="M10 24H28" strokeOpacity="0.4" />
    <path d="M2 32H36C37.1 32 38 32.9 38 34V35H0V34C0 32.9 0.9 32 2 32Z" />
    {/* Smartphone overlapping */}
    <rect x="29" y="16" width="13" height="24" rx="2.5" />
    <line x1="33" y1="36" x2="37" y2="36" />
    <circle cx="35.5" cy="19.5" r="0.75" fill="currentColor" />
  </svg>
);

export const FashionHangerIcon: React.FC<LucideProps> = ({ className = "w-12 h-12", ...props }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Hanger Hook */}
    <path d="M24 16C24 12.69 26.69 10 30 10C32.21 10 34 11.79 34 14C34 16.21 32.21 18 30 18H24V21" />
    {/* Hanger Body */}
    <path d="M24 21L7 30C5.34 30.89 5.86 33 7.76 33H40.24C42.14 33 42.66 30.89 41 30L24 21Z" />
    <path d="M8 33V40C8 41.1 8.9 42 10 42H38C39.1 42 40 41.1 40 40V33" strokeOpacity="0.5" />
    {/* Garment lines */}
    <path d="M20 28V38" strokeOpacity="0.4" />
    <path d="M28 28V38" strokeOpacity="0.4" />
  </svg>
);

export const GroceryBasketIcon: React.FC<LucideProps> = ({ className = "w-12 h-12", ...props }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Handle */}
    <path d="M14 20C14 13.37 18.48 8 24 8C29.52 8 34 13.37 34 20" />
    {/* Basket body */}
    <path d="M6 20H42L37.5 39C37.2 40.7 35.7 42 34 42H14C12.3 42 10.8 40.7 10.5 39L6 20Z" />
    {/* Woven weave lines */}
    <line x1="12" y1="27" x2="36" y2="27" strokeOpacity="0.4" />
    <line x1="15" y1="34" x2="33" y2="34" strokeOpacity="0.4" />
    <line x1="24" y1="20" x2="24" y2="42" strokeOpacity="0.4" />
  </svg>
);

export const BeautyPerfumeIcon: React.FC<LucideProps> = ({ className = "w-12 h-12", ...props }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Cap */}
    <rect x="20" y="7" width="8" height="6" rx="1.5" />
    {/* Neck */}
    <rect x="22" y="13" width="4" height="4" />
    {/* Flacon body */}
    <path d="M13 17H35C36.66 17 38 18.34 38 20V39C38 41.21 36.21 43 34 43H14C11.79 43 10 41.21 10 39V20C10 18.34 11.34 17 13 17Z" />
    {/* Label frame */}
    <rect x="17" y="24" width="14" height="12" rx="2" strokeOpacity="0.4" />
    {/* Sparkles */}
    <path d="M39 10L40 7L41 10L44 11L41 12L40 15L39 12L36 11Z" fill="currentColor" stroke="none" />
    <circle cx="8" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const ApplianceIcon: React.FC<LucideProps> = ({ className = "w-12 h-12", ...props }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Modern Refrigerator & Appliance combo */}
    <rect x="12" y="6" width="24" height="36" rx="3" />
    <line x1="12" y1="20" x2="36" y2="20" />
    <line x1="17" y1="11" x2="17" y2="16" />
    <line x1="17" y1="24" x2="17" y2="33" />
    {/* Digital Dispenser / indicator */}
    <rect x="27" y="11" width="5" height="5" rx="1" strokeOpacity="0.4" />
    <circle cx="29.5" cy="25" r="1" fill="currentColor" />
  </svg>
);

export const AutoVehicleIcon: React.FC<LucideProps> = ({ className = "w-12 h-12", ...props }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Modern Car front silhouette */}
    <path d="M12 20L15.5 10H32.5L36 20" />
    <path d="M8 20H40C41.66 20 43 21.34 43 23V31C43 32.66 41.66 34 40 34H8C6.34 34 5 32.66 5 31V23C5 21.34 6.34 20 8 20Z" />
    {/* Headlights */}
    <ellipse cx="11" cy="26" rx="3" ry="2" />
    <ellipse cx="37" cy="26" rx="3" ry="2" />
    {/* Grille */}
    <path d="M19 26H29" />
    <path d="M20 29H28" />
    {/* Wheels */}
    <rect x="7" y="34" width="6" height="6" rx="1.5" />
    <rect x="35" y="34" width="6" height="6" rx="1.5" />
  </svg>
);

export const ToolDrillIcon: React.FC<LucideProps> = ({ className = "w-12 h-12", ...props }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Crossed Hammer and Wrench */}
    {/* Hammer */}
    <path d="M18 10L24 6L28 10L22 14L18 10Z" />
    <path d="M20 12L36 38C36.8 39.3 38.6 39.6 39.9 38.8C41.2 38 41.5 36.2 40.7 34.9L24 16" />
    {/* Wrench head */}
    <path d="M10 20C11.5 21.5 13.8 22 15.8 21.3L32 37" />
    <path d="M7 16L12 11C13.5 12 15.5 12 17 11L18 16" />
  </svg>
);

export const SportFitnessIcon: React.FC<LucideProps> = ({ className = "w-12 h-12", ...props }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Dumbbell */}
    <path d="M12 18V30" />
    <path d="M8 20V28" />
    <path d="M36 18V30" />
    <path d="M40 20V28" />
    {/* Central bar */}
    <line x1="12" y1="24" x2="36" y2="24" strokeWidth="2.8" />
    {/* Collar stops */}
    <rect x="15" y="21" width="3" height="6" rx="1" fill="currentColor" />
    <rect x="30" y="21" width="3" height="6" rx="1" fill="currentColor" />
  </svg>
);

// Baby category icon: "sauf pour bebe en le laisse comme il est"
export const BabyIcon = Baby;

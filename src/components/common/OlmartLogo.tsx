import React from "react";
import { Link } from "react-router-dom";

interface OlmartLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  to?: string;
}

/**
 * Emblème officiel Olmart : Bouton/Magasin dans l'hexagone ouvert
 */
export const OlmaIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg
    viewBox="92 70 154 175"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Olmart Emblem"
  >
    <g fill="none" stroke="#064f50" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M241 113 L170 74 L98 116 L98 198 L170 239 L241 199" strokeWidth="5.2" />
      <path d="M237 116 L170 80 L104 119 L104 195 L170 233 L237 196" strokeWidth="2.2" />
      <path d="M126 136 L135 123 L198 123 L207 136" strokeWidth="2.8" />
      <path
        d="M126 136 L207 136 L207 140 C207 147 201 152 195 152 C189 152 184 147 184 141 C184 148 179 153 172 153 C165 153 160 148 160 141 C160 148 155 153 148 153 C141 153 136 148 136 141 C136 148 132 152 126 152 C120 152 125 143 126 136 Z"
        strokeWidth="2.8"
      />
      <path d="M132 153 L132 196 L202 196 L202 153" strokeWidth="2.8" />
      <path d="M143 196 L143 162 L161 162 L161 196" strokeWidth="2.8" />
      <circle cx="155" cy="180" r="1.7" fill="#064f50" stroke="none" />
      <rect x="171" y="162" width="21" height="21" strokeWidth="2.8" />
    </g>
  </svg>
);

/**
 * Logo officiel Olmart complet vectoriel (Emblème storefront + Wordmark géométrique turquoise)
 */
export const OlmartFullLogo: React.FC<{ className?: string }> = ({ className = "h-8 sm:h-9 w-auto" }) => (
  <svg
    viewBox="90 70 385 175"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="OLMART Marketplace"
  >
    <g fill="none" stroke="#064f50" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M241 113 L170 74 L98 116 L98 198 L170 239 L241 199" strokeWidth="5.2" />
      <path d="M237 116 L170 80 L104 119 L104 195 L170 233 L237 196" strokeWidth="2.2" />
      <path d="M126 136 L135 123 L198 123 L207 136" strokeWidth="2.8" />
      <path
        d="M126 136 L207 136 L207 140 C207 147 201 152 195 152 C189 152 184 147 184 141 C184 148 179 153 172 153 C165 153 160 148 160 141 C160 148 155 153 148 153 C141 153 136 148 136 141 C136 148 132 152 126 152 C120 152 125 143 126 136 Z"
        strokeWidth="2.8"
      />
      <path d="M132 153 L132 196 L202 196 L202 153" strokeWidth="2.8" />
      <path d="M143 196 L143 162 L161 162 L161 196" strokeWidth="2.8" />
      <circle cx="155" cy="180" r="1.7" fill="#064f50" stroke="none" />
      <rect x="171" y="162" width="21" height="21" strokeWidth="2.8" />
    </g>
    <g fill="#53d3dc">
      <path fillRule="evenodd" d="M231 138 H264 V177 H231 Z M239 146 V169 H256 V146 Z" />
      <path d="M272 138 H281 V168 H300 V177 H272 Z" />
      <path d="M307 177 V138 H317 L329 154 L341 138 H351 V177 H342 V152 L329 169 L316 152 V177 Z" />
      <path fillRule="evenodd" d="M358 177 L371 138 H383 L397 177 H387 L384 167 H370 L367 177 Z M372 159 H382 L377 145 Z" />
      <path fillRule="evenodd" d="M403 138 H431 Q438 138 438 146 V157 Q438 164 431 165 L440 177 H429 L420 165 H412 V177 H403 Z M412 146 V157 H428 V146 Z" />
      <path d="M443 138 H469 V147 H460 V177 H451 V147 H443 Z" />
    </g>
  </svg>
);

export const OlmartLogo: React.FC<OlmartLogoProps> = ({
  className = "",
  iconClassName = "w-8 h-8",
  showText = true,
  to = "/",
}) => {
  const content = showText ? (
    <div className={`inline-flex items-center group select-none transition-transform active:scale-95 ${className}`}>
      <OlmartFullLogo className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-102" />
    </div>
  ) : (
    <div className={`inline-flex items-center group select-none transition-transform active:scale-95 ${className}`}>
      <OlmaIcon className={`${iconClassName} transition-transform duration-200 group-hover:scale-105`} />
    </div>
  );

  if (to) {
    return (
      <Link to={to} title="Retour à l'accueil Olmart" aria-label="Accueil Olmart">
        {content}
      </Link>
    );
  }

  return content;
};

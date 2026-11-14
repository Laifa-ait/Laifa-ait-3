export interface DlpFilterResult {
  secureText: string;
  violationDetected: boolean;
}

export const filterChatDlp = (text: string): DlpFilterResult => {
  if (!text) {
    return { secureText: "", violationDetected: false };
  }

  const phonePattern = /(0[5672349][0-9]{8}|(\+213|00213)[5672349][0-9]{8})/i;
  const socialPattern = /\b(whatsapp|viber|telegram|insta|instagram|fb|facebook|tiktok)\b/i;
  const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i;
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;

  let secureText = text;
  let violationDetected = false;

  if (phonePattern.test(secureText)) {
    violationDetected = true;
    secureText = secureText.replace(new RegExp(phonePattern.source, "gi"), "[NUMÉRO MASQUÉ]");
  }
  if (socialPattern.test(secureText)) {
    violationDetected = true;
    secureText = secureText.replace(new RegExp(socialPattern.source, "gi"), "[CANAL EXTERNE INTERDIT]");
  }
  if (urlPattern.test(secureText)) {
    violationDetected = true;
    secureText = secureText.replace(new RegExp(urlPattern.source, "gi"), "[LIEN INTERDIT]");
  }
  if (emailPattern.test(secureText)) {
    violationDetected = true;
    secureText = secureText.replace(new RegExp(emailPattern.source, "gi"), "[EMAIL MASQUÉ]");
  }

  return { secureText, violationDetected };
};

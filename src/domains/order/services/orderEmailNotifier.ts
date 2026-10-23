import nodemailer from "nodemailer";
import { admin } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendLowStockEmail = async (sellerEmail: string, message: string) => {
  try {
    if (!process.env.SMTP_USER) {
      safeLogger.info("Mock Email Sent (SMTP not configured)", { to: sellerEmail, message });
      return;
    }
    await transporter.sendMail({
      from: '"Olmart" <noreply@olmart.dz>',
      to: sellerEmail,
      subject: "⚠️ Alerte Stock Critique - Olmart",
      text: message,
    });
  } catch (err) {
    safeLogger.error("Failed to send stock alert email", { err: err instanceof Error ? err.message : String(err) });
  }
};

export const sendTwoFactorOtpEmail = async (userEmail: string, code: string): Promise<void> => {
  if (!userEmail) return;
  try {
    if (!process.env.SMTP_USER) {
      safeLogger.info("2FA OTP Email queued (SMTP not configured in dev/test)", { to: userEmail });
      return;
    }
    await transporter.sendMail({
      from: '"Olmart Sécurité" <noreply@olmart.dz>',
      to: userEmail,
      subject: "🔒 Votre code de vérification 2FA Olmart",
      text: `Bonjour,\n\nVotre code de vérification à double facteur (2FA) Olmart est : ${code}\nCe code est valable pendant 10 minutes. Ne le partagez jamais.\n\nL'équipe Sécurité Olmart`,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e4e4e7;border-radius:16px;">
        <h2 style="color:#18181b;margin-top:0;">🔒 Code de vérification 2FA Olmart</h2>
        <p style="color:#52525b;font-size:14px;">Utilisez le code à 6 chiffres ci-dessous pour valider votre session sécurisée :</p>
        <div style="background:#f4f4f5;padding:16px;border-radius:12px;text-align:center;font-size:28px;font-weight:bold;letter-spacing:6px;color:#18181b;margin:20px 0;">${code}</div>
        <p style="color:#71717a;font-size:12px;">Ce code expire dans <strong>10 minutes</strong>. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
      </div>`,
    });
  } catch (err) {
    safeLogger.error("Failed to send 2FA OTP email", { err: err instanceof Error ? err.message : String(err) });
  }
};

export interface OrderEmailSubOrder {
  sellerId: string;
  subOrderId: string;
  items: Array<{ name?: string; quantity?: number; price?: number; [key: string]: unknown }>;
  total: number;
}

export const sendOrderConfirmationEmails = async (
  buyerEmail: string,
  buyerName: string,
  orderId: string,
  grandTotal: number,
  subOrders: OrderEmailSubOrder[]
) => {
  try {
    if (!process.env.SMTP_USER) {
      safeLogger.info("Mock Email Sent (SMTP not configured)", { to: buyerEmail, orderId });
      return;
    }

    if (buyerEmail) {
      await transporter.sendMail({
        from: '"Olmart" <noreply@olmart.dz>',
        to: buyerEmail,
        subject: `Confirmation de votre commande #${orderId} - Olmart`,
        html: `<h2>Merci pour votre commande, ${buyerName} !</h2>
               <p>Votre commande porte la référence <strong>#${orderId}</strong> a bien été enregistrée.</p>
               <p>Montant total : <strong>${grandTotal} DZD</strong> (Paiement à la livraison).</p>
               <p>Nos vendeurs préparent vos articles.</p>
               <br/><p>L'équipe Olmart</p>`,
      });
    }

    for (const so of subOrders) {
      const userSnap = await admin.firestore().collection("users").doc(so.sellerId).get();
      const sellerEmail = userSnap.data()?.email;

      if (sellerEmail) {
        const itemsHtml = so.items.map((i) => `<li>${i.quantity}x ${i.name}</li>`).join("");
        await transporter.sendMail({
          from: '"Olmart" <noreply@olmart.dz>',
          to: sellerEmail,
          subject: `Nouvelle commande reçue #${so.subOrderId} - Olmart`,
          html: `<h2>Bonjour, vous avez reçu une nouvelle commande !</h2>
                 <p>La référence de la sous-commande est <strong>#${so.subOrderId}</strong>.</p>
                 <p>Produits commandés :</p>
                 <ul>${itemsHtml}</ul>
                 <p>Total à préparer : <strong>${so.total} DZD</strong>.</p>
                 <br/><p>Connectez-vous à votre espace vendeur pour la traiter.</p>`,
        });
      }
    }
  } catch (err) {
    safeLogger.error("Failed to send order confirmation emails", {
      err: err instanceof Error ? err.message : String(err),
    });
  }
};

import { apiPost } from "../lib/api";

export interface NewsletterSubscribeResponse {
  success: boolean;
  alreadySubscribed?: boolean;
  error?: string;
}

export const subscribeToNewsletter = async (email: string): Promise<NewsletterSubscribeResponse> => {
  try {
    return await apiPost<NewsletterSubscribeResponse>("/api/v1/newsletter/subscribe", { email });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
      const errMsg = (err as { message: string }).message;
      if (errMsg.includes("ALREADY_SUBSCRIBED")) {
        return { success: true, alreadySubscribed: true };
      }
    }
    throw err;
  }
};

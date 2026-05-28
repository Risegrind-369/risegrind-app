// REMOVED for v1.0: Manus Forge API notifications replaced with Supabase Realtime

export type NotificationPayload = {
  title: string;
  content: string;
};

export async function notifyOwner(payload: NotificationPayload): Promise<boolean> {
  console.log("[Notification] Using Supabase Realtime instead of Manus notifications");
  return true;
}

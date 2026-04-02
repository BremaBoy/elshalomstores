import { createServer } from "@/lib/supabase-server";
import { NotificationCenterClient } from "@/components/account/NotificationCenterClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = createServer();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <NotificationCenterClient initialNotifications={notifications as any || []} />
  );
}

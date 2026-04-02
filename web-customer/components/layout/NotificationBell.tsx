"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const NotificationBell = ({ userId }: { userId: string }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // 1. Initial Fetch
    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    // 2. Real-time Subscription
    const channel = supabase
      .channel(`header-notifications-${userId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <Link href="/account/notifications">
      <Button variant="ghost" size="icon" className="relative text-text-secondary hover:text-primary">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  );
};

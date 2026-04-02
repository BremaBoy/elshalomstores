"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, CheckCircle2, Trash2, Clock, Circle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { OrderNotification } from "@/types/order";

export const NotificationCenterClient = ({ initialNotifications }: { initialNotifications: OrderNotification[] }) => {
  const [notifications, setNotifications] = useState<OrderNotification[]>(initialNotifications);

  useEffect(() => {
    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications(prev => [payload.new as OrderNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id);
    
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-xl min-h-[600px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-slate-50 gap-4">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-text-primary">
            Notification <span className="text-primary">Center</span>
          </h3>
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">
            Stay updated with your order progress and account alerts.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            onClick={markAllAsRead}
            className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-full px-6"
          >
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={cn(
                "p-6 rounded-3xl transition-all border flex gap-6 group",
                notif.is_read 
                  ? "bg-white border-slate-100 text-slate-500" 
                  : "bg-primary/5 border-primary/10 text-text-primary shadow-sm"
              )}
            >
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                notif.is_read ? "bg-slate-50" : "bg-primary/10"
              )}>
                {notif.is_read ? <Bell className="h-6 w-6 text-slate-300" /> : <Circle className="h-6 w-6 text-primary fill-primary animate-pulse" />}
              </div>

              <div className="flex-grow space-y-1">
                <div className="flex justify-between items-start">
                   <h4 className={cn("text-sm uppercase tracking-tight font-black", notif.is_read ? "text-slate-400" : "text-text-primary")}>
                      {notif.title}
                   </h4>
                   <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="h-3 w-3" /> {new Date(notif.created_at).toLocaleDateString()}
                   </span>
                </div>
                <p className="text-xs font-medium leading-relaxed opacity-80">{notif.message}</p>
                
                <div className="pt-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   {!notif.is_read && (
                     <button 
                       onClick={() => markAsRead(notif.id)}
                       className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5 hover:underline"
                     >
                       <CheckCircle2 className="h-3.5 w-3.5" /> Mark as read
                     </button>
                   )}
                   <button 
                     onClick={() => deleteNotification(notif.id)}
                     className="text-[9px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1.5 hover:underline"
                   >
                     <Trash2 className="h-3.5 w-3.5" /> Delete
                   </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center">
             <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="h-12 w-12 text-slate-200" />
             </div>
             <h4 className="text-lg font-black text-text-secondary uppercase tracking-widest">Quiet for now</h4>
             <p className="text-slate-500 text-sm mt-2 font-medium">When you receive a notification, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

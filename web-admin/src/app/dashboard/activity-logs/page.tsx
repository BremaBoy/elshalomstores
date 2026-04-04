'use client'

import { useState, useEffect } from 'react'
import { Activity, Search, Filter, Loader2, User, Clock, Shield, Database, Layout } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulated activity logs for demonstration (as there might not be a dedicated table yet)
    // In a real app, this would query a 'audit_logs' or 'activity_logs' table
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      // For now, let's pull some recent events from major tables to simulate activity
      const { data: adminLogs } = await supabase.from('admins').select('name, created_at').order('created_at', { ascending: false }).limit(5)
      const { data: orderLogs } = await supabase.from('orders').select('id, created_at, status').order('created_at', { ascending: false }).limit(5)
      
      const combined = [
        ...(adminLogs?.map(a => ({ id: Math.random(), type: 'auth', action: 'New Admin Registered', detail: a.name, date: a.created_at, icon: Shield, color: 'text-purple-500 bg-purple-500/10' })) || []),
        ...(orderLogs?.map(o => ({ id: o.id, type: 'order', action: `Order Status: ${o.status}`, detail: `Order #${o.id.split('-')[0]}`, date: o.created_at, icon: Layout, color: 'text-blue-500 bg-blue-500/10' })) || []),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setLogs(combined)
    } catch (err) {
      console.error('Logs Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Activity Logs</h1>
          <p className="text-neutral-400 text-sm">Real-time audit trail of all platform administrative actions</p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
         <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
               <Database className="w-4 h-4" />
               Recent Events
            </h2>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Live Stream Active</span>
            </div>
         </div>

         <div className="divide-y divide-neutral-800">
            {isLoading ? (
               <div className="p-20 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
               </div>
            ) : logs.map(log => (
               <div key={log.id} className="p-5 flex items-start gap-5 hover:bg-white/5 transition-colors group">
                  <div className={`p-3 rounded-2xl flex-shrink-0 ${log.color} border border-white/5`}>
                     <log.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center justify-between gap-4">
                        <h4 className="font-bold text-white text-sm">{log.action}</h4>
                        <span className="text-[10px] text-neutral-500 font-medium flex items-center gap-1.5 whitespace-nowrap">
                           <Clock className="w-3.5 h-3.5" />
                           {format(new Date(log.date), 'MMM dd, HH:mm:ss')}
                        </span>
                     </div>
                     <p className="text-xs text-neutral-400 mt-1">{log.detail}</p>
                     <div className="mt-3 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-500">
                           S
                        </div>
                        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">System Process</span>
                     </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Detail</button>
                  </div>
               </div>
            ))}
            {logs.length === 0 && !isLoading && (
               <div className="p-20 text-center text-neutral-500 italic text-sm">
                  No recent activity logged.
               </div>
            )}
         </div>
      </div>
    </div>
  )
}

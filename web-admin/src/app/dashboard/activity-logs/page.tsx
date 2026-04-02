'use client'

import { Package, ShoppingCart, Users, Settings2, Shield } from 'lucide-react'

const LOGS = [
  { id: '1', admin: 'John Adeyemi', role: 'SUPER_ADMIN', action: 'Created product', target: 'Ariel Laundry Detergent 3kg (#PRD-2034)', ip: '197.211.58.21', time: 'Mar 11, 2026 09:32' },
  { id: '2', admin: 'Mary Okonkwo', role: 'ADMIN', action: 'Updated order status', target: 'Order #ORD-1041 → Processing', ip: '197.211.58.44', time: 'Mar 11, 2026 10:15' },
  { id: '3', admin: 'John Adeyemi', role: 'SUPER_ADMIN', action: 'Created admin account', target: 'David Tijani (david@elshalomstores.com.ng)', ip: '197.211.58.21', time: 'Mar 10, 2026 14:00' },
  { id: '4', admin: 'Mary Okonkwo', role: 'ADMIN', action: 'Suspended customer', target: 'Blessing Osei (blessing@mail.com)', ip: '197.211.58.44', time: 'Mar 10, 2026 11:30' },
  { id: '5', admin: 'John Adeyemi', role: 'SUPER_ADMIN', action: 'Updated store settings', target: 'Payment gateway keys', ip: '197.211.58.21', time: 'Mar 9, 2026 16:45' },
]

const actionIcon: Record<string, React.ElementType> = {
  'Created product': Package,
  'Updated order status': ShoppingCart,
  'Created admin account': Shield,
  'Suspended customer': Users,
  'Updated store settings': Settings2,
}

export default function ActivityLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">All admin actions are tracked for security and accountability</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-border">
          {LOGS.map(log => {
            const Icon = actionIcon[log.action] ?? Package
            return (
              <div key={log.id} className="px-5 py-4 flex items-start gap-4 hover:bg-muted/20 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{log.admin}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {log.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    <span className="font-medium text-foreground">{log.action}</span>: {log.target}
                  </p>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                    <span>IP: {log.ip}</span>
                    <span>{log.time}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

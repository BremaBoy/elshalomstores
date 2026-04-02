'use client'

import { AlertTriangle, Package } from 'lucide-react'

const INVENTORY = [
  { id: '1', name: 'Ariel Laundry Detergent 3kg', sku: 'HH-001', stock: 82, threshold: 20, status: 'ok' },
  { id: '2', name: 'Chef Premium Frying Pan', sku: 'KU-003', stock: 0, threshold: 10, status: 'out' },
  { id: '3', name: 'Olive Oil Scented Candle', sku: 'OC-007', stock: 14, threshold: 20, status: 'low' },
  { id: '4', name: 'Nivea Body Lotion 400ml', sku: 'CP-012', stock: 130, threshold: 30, status: 'ok' },
  { id: '5', name: 'Oral-B Toothbrush Set', sku: 'DN-019', stock: 220, threshold: 40, status: 'ok' },
  { id: '6', name: 'iPhone 15 Screen Protector', sku: 'PA-022', stock: 5, threshold: 15, status: 'low' },
]

const LOGS = [
  { id: '1', product: 'Ariel Laundry Detergent', prev: 60, curr: 82, action: 'Restock', admin: 'John Adeyemi', time: 'Mar 11, 2026 09:30' },
  { id: '2', product: 'Chef Premium Frying Pan', prev: 10, curr: 0, action: 'Sale', admin: 'Mary Okonkwo', time: 'Mar 10, 2026 14:12' },
  { id: '3', product: 'Olive Oil Scented Candle', prev: 20, curr: 14, action: 'Sale', admin: 'System', time: 'Mar 10, 2026 11:45' },
]

const statusStyle: Record<string, string> = {
  ok: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  low: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  out: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function InventoryPage() {
  const outOfStock = INVENTORY.filter(i => i.status === 'out').length
  const lowStock = INVENTORY.filter(i => i.status === 'low').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-muted-foreground text-sm mt-1">Track stock levels and manage reorders</p>
      </div>

      {/* Alert Banner */}
      {(outOfStock > 0 || lowStock > 0) && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-yellow-500/30 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>{outOfStock} products are out of stock</strong> and <strong>{lowStock} products are low on stock</strong>. Action required.
          </span>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left bg-muted/40">
                <th className="px-5 py-3.5 font-medium">Product</th>
                <th className="px-5 py-3.5 font-medium">SKU</th>
                <th className="px-5 py-3.5 font-medium">Stock</th>
                <th className="px-5 py-3.5 font-medium">Threshold</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {INVENTORY.map(item => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{item.sku}</td>
                  <td className="px-5 py-4 font-bold">{item.stock}</td>
                  <td className="px-5 py-4 text-muted-foreground">{item.threshold}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[item.status]}`}>
                      {item.status === 'ok' ? 'In Stock' : item.status === 'low' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <input type="number" defaultValue={item.stock} min={0} className="w-20 px-2 py-1 text-sm rounded-lg border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Logs */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Inventory Logs</h2>
        </div>
        <div className="divide-y divide-border">
          {LOGS.map(log => (
            <div key={log.id} className="px-5 py-3.5 flex items-center justify-between gap-4 text-sm hover:bg-muted/20 transition-colors">
              <div>
                <span className="font-medium">{log.product}</span>
                <span className="text-muted-foreground ml-2">Stock: {log.prev} → {log.curr}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${log.action === 'Restock' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{log.action}</span>
              <span className="text-muted-foreground text-xs hidden sm:block">{log.admin}</span>
              <span className="text-muted-foreground text-xs">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

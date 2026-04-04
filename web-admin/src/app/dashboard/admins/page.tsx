'use client'

import { useState, useEffect } from 'react'
import { Shield, Plus, Search, Loader2, Mail, User, BadgeCheck, MoreHorizontal, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('role', { ascending: false })

      if (error) throw error
      setAdmins(data || [])
    } catch (err) {
      console.error('Admins Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAdmins = admins.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Management</h1>
          <p className="text-neutral-400 text-sm">Create and oversee platform administrator accounts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-semibold text-sm shadow-lg shadow-purple-900/20">
          <Plus className="w-4 h-4" />
          <span>New Admin</span>
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-neutral-950 text-neutral-500 font-medium border-b border-neutral-800 uppercase tracking-widest text-[10px]">
                <th className="px-6 py-4">Administrator</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : filteredAdmins.map(admin => (
                <tr key={admin.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-300">
                         {admin.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                         <p className="font-bold text-white text-xs">{admin.name}</p>
                         <div className="flex items-center gap-1 text-[10px] text-neutral-500 mt-0.5">
                            <Mail className="w-2.5 h-2.5" />
                            {admin.email}
                         </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-3.5 h-3.5 ${admin.role === 'SUPER_ADMIN' ? 'text-purple-500' : 'text-blue-500'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${admin.role === 'SUPER_ADMIN' ? 'text-purple-400' : 'text-blue-400'}`}>
                        {admin.role.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      admin.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <p className="font-mono text-[9px] text-neutral-600 truncate max-w-[80px]" title={admin.id}>{admin.id}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-neutral-500 hover:text-white transition-colors">
                           <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-neutral-600 hover:text-red-500 transition-colors">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

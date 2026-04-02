'use client'

import { useState } from 'react'
import {
  Search,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Edit,
  Trash2,
  Mail,
  Calendar,
  X,
  MoreVertical
} from 'lucide-react'
import { AdminForm } from '@/components/forms/AdminForm'
import { Admin } from '@/types'

import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

export default function AdminsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<any | undefined>()
  const [admins, setAdmins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['admin', 'super_admin'])
        .order('created_at', { ascending: false })

      if (error) throw error
      setAdmins(data || [])
    } catch (err: any) {
      console.error('Error fetching admins:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    try {
      if (editingAdmin) {
        const { error } = await supabase
          .from('users')
          .update(data)
          .eq('id', editingAdmin.id)
        if (error) throw error
      } else {
        // Invite logic usually handled by Auth, but direct insert for profile is sometimes needed
        const { error } = await supabase
          .from('users')
          .insert([{ ...data, created_at: new Date().toISOString() }])
        if (error) throw error
      }
      await fetchAdmins()
      setShowForm(false)
      setEditingAdmin(undefined)
    } catch (err: any) {
      alert(`Operation failed: ${err.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this admin? This cannot be undone.')) return
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
      if (error) throw error
      setAdmins(admins.filter(a => a.id !== id))
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admins & Staff</h1>
          <p className="text-sm text-neutral-400">Manage account access and system permissions</p>
        </div>
        <button 
          onClick={() => {
            setEditingAdmin(undefined)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Invite New Admin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <div key={admin.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                admin.role === 'SUPER_ADMIN' ? 'bg-primary/10 text-primary' : 'bg-neutral-800 text-neutral-400'
              }`}>
                {admin.role === 'SUPER_ADMIN' ? <ShieldCheck className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setEditingAdmin(admin)
                    setShowForm(true)
                  }}
                  className="p-2 text-neutral-500 hover:text-white bg-neutral-800/50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(admin.id)}
                  className="p-2 text-neutral-500 hover:text-red-500 bg-neutral-800/50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white">{admin.name}</h3>
            <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
              <Mail className="w-3.5 h-3.5" />
              {admin.email}
            </div>

            <div className="mt-6 flex items-center justify-between py-3 border-t border-neutral-800/50">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                admin.role === 'super_admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-neutral-800 text-neutral-500'
              }`}>
                {admin.role?.replace('_', ' ')}
              </span>
              <span className={`flex items-center gap-1.5 text-xs font-medium ${
                !admin.is_suspended ? 'text-green-500' : 'text-neutral-500'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${!admin.is_suspended ? 'bg-green-500' : 'bg-neutral-600'}`} />
                {admin.is_suspended ? 'suspended' : 'active'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-4 text-[11px] text-neutral-600 italic">
              <Calendar className="w-3 h-3" />
              Joined {admin.created_at}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
              <div>
                <h2 className="text-xl font-bold text-white">{editingAdmin ? 'Update Permissions' : 'Invite Admin'}</h2>
                <p className="text-sm text-neutral-500">Configure administrative access</p>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="p-2 text-neutral-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <AdminForm initialData={editingAdmin} onSubmit={handleCreate} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

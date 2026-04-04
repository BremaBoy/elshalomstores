'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, Globe, Lock, Bell, Palette, Database, Code, CreditCard } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [isLoading, setIsLoading] = useState(false)

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'payments', label: 'Payment Gateways', icon: CreditCard },
    { id: 'advanced', label: 'Advanced', icon: Code },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-neutral-400 text-sm">Configure global platform behavior and appearance</p>
        </div>
        <button 
          onClick={() => setIsLoading(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-all font-bold text-sm shadow-xl shadow-purple-900/40"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Tabs */}
        <aside className="lg:w-64 flex-shrink-0 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === tab.id 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-inner' 
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 max-w-3xl">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Store Profile</h3>
                  <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold mb-6">Identity & Contact</p>
                  
                  <div className="grid gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-neutral-400">Store Name</label>
                       <input 
                         type="text" 
                         defaultValue="Elshalomstores" 
                         className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Support Email</label>
                        <input 
                          type="email" 
                          defaultValue="support@elshalomstores.com.ng" 
                          className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Phone Number</label>
                        <input 
                          type="text" 
                          defaultValue="+234 800 000 0000" 
                          className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-neutral-800">
                  <h3 className="text-lg font-bold text-white mb-2">Localization</h3>
                  <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold mb-6">Currency & Units</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-400">Base Currency</label>
                      <select className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:ring-1 focus:ring-primary focus:outline-none transition-all">
                        <option>Nigerian Naira (₦)</option>
                        <option>US Dollar ($)</option>
                        <option>British Pound (£)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-400">Time Zone</label>
                      <select className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:ring-1 focus:ring-primary focus:outline-none transition-all">
                        <option>(GMT+01:00) West Central Africa</option>
                        <option>(GMT+00:00) UTC</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div className="text-center py-20 text-neutral-500 animate-in fade-in zoom-in-95 duration-500">
                 <Lock className="w-12 h-12 mx-auto mb-4 opacity-10" />
                 <p className="text-sm">Security policies and two-factor authentication controls.</p>
                 <p className="text-[10px] uppercase font-bold mt-2 text-primary tracking-widest">Available in next update</p>
              </div>
            )}

            {activeTab !== 'general' && activeTab !== 'security' && (
               <div className="text-center py-20 text-neutral-500 animate-pulse">
                  <Settings className="w-10 h-10 mx-auto mb-4 opacity-5" />
                  <p className="text-xs uppercase font-bold tracking-widest">Module under construction</p>
               </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}



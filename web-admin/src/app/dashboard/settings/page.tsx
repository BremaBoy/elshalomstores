'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Save, Globe, Lock, Bell, Palette, Database, Code, CreditCard, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchSettings, saveSettings } from '@/app/actions/settingsActions'

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('general')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [settings, setSettings] = useState({
    store_name: 'Elshalomstores',
    support_email: 'support@elshalomstores.com.ng',
    phone: '+234 800 000 0000',
    currency: 'NGN',
    timezone: 'Africa/Lagos',
  })

  useEffect(() => {
    fetchSettings().then(result => {
      if (result.success && result.data) setSettings(current => ({ ...current, ...result.data }))
    })
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    setMessage('')
    const result = await saveSettings(settings)
    setIsLoading(false)
    setMessage(result.success ? 'Settings saved successfully.' : result.error || 'Unable to save settings.')
  }

  const tabs = [
    { id: 'profile', label: 'My Account', icon: User, path: '/dashboard/profile' },
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
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground text-sm">Configure global platform behavior and appearance</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all font-bold text-sm shadow-xl shadow-primary/20"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? 'Saving…' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Tabs */}
        <aside className="lg:w-64 flex-shrink-0 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.path) {
                  router.push(tab.path)
                } else {
                  setActiveTab(tab.id)
                }
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === tab.id 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-inner' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-card'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 max-w-3xl">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Store Profile</h3>
                  <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold mb-6">Identity & Contact</p>
                  
                  <div className="grid gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-muted-foreground">Store Name</label>
                       <input 
                         type="text" 
                         value={settings.store_name}
                         onChange={event => setSettings({ ...settings, store_name: event.target.value })}
                         className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Support Email</label>
                        <input 
                          type="email" 
                          value={settings.support_email}
                          onChange={event => setSettings({ ...settings, support_email: event.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                        <input 
                          type="text" 
                          value={settings.phone}
                          onChange={event => setSettings({ ...settings, phone: event.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-border">
                  <h3 className="text-lg font-bold text-foreground mb-2">Localization</h3>
                  <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold mb-6">Currency & Units</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Base Currency</label>
                      <select value={settings.currency} onChange={event => setSettings({ ...settings, currency: event.target.value })} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none transition-all">
                        <option value="NGN">Nigerian Naira (₦)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="GBP">British Pound (£)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Time Zone</label>
                      <select value={settings.timezone} onChange={event => setSettings({ ...settings, timezone: event.target.value })} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none transition-all">
                        <option value="Africa/Lagos">(GMT+01:00) West Central Africa</option>
                        <option value="UTC">(GMT+00:00) UTC</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {message && <p className={`mt-6 text-sm ${message.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
            
            {activeTab === 'security' && (
              <div className="text-center py-20 text-muted-foreground animate-in fade-in zoom-in-95 duration-500">
                 <Lock className="w-12 h-12 mx-auto mb-4 opacity-10" />
                 <p className="text-sm">Security policies and two-factor authentication controls.</p>
                 <p className="text-[10px] uppercase font-bold mt-2 text-primary tracking-widest">Available in next update</p>
              </div>
            )}

            {activeTab !== 'general' && activeTab !== 'security' && (
               <div className="text-center py-20 text-muted-foreground animate-pulse">
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

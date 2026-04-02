'use client'

import { Save, Store, CreditCard, Truck, Mail } from 'lucide-react'

function SettingGroup({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, placeholder, type = 'text', defaultValue }: { label: string; placeholder?: string; type?: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-transparent focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your store configuration and integrations</p>
      </div>

      <SettingGroup title="Store Information" icon={Store}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Store Name" defaultValue="Elshalomstores" />
          <Field label="Support Email" type="email" defaultValue="support@elshalomstores.com.ng" />
          <Field label="Contact Phone" defaultValue="+234 800 000 0000" />
          <Field label="Store Address" defaultValue="Lagos, Nigeria" />
        </div>
      </SettingGroup>

      <SettingGroup title="Payment Gateways" icon={CreditCard}>
        <div className="grid grid-cols-1 gap-4">
          <Field label="Paystack Secret Key" type="password" placeholder="sk_live_..." />
          <Field label="Paystack Public Key" placeholder="pk_live_..." />
          <Field label="Flutterwave Secret Key" type="password" placeholder="FLWSECK-..." />
        </div>
      </SettingGroup>

      <SettingGroup title="Shipping Configuration" icon={Truck}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Default Courier" defaultValue="DHL Express" />
          <Field label="Free Shipping Threshold (₦)" defaultValue="20000" />
          <Field label="Standard Delivery (days)" defaultValue="3-5" />
          <Field label="Express Delivery (days)" defaultValue="1-2" />
        </div>
      </SettingGroup>

      <SettingGroup title="Email Notifications" icon={Mail}>
        <div className="space-y-3">
          {['Order Confirmation', 'Shipping Updates', 'Low Stock Alerts', 'New Customer Registration'].map(item => (
            <label key={item} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-primary" />
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>
      </SettingGroup>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:opacity-90 transition-opacity">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  )
}

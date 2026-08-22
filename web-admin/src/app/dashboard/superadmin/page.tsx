'use client'

import DashboardPage from '../page'

export default function SuperAdminDashboard() {
    return (
        <div className="space-y-6">
            <div className="p-4 bg-gold-soft border border-gold/30 rounded-2xl mb-6">
                <p className="text-[#694B12] text-sm font-semibold">Super Admin workspace · Full operational access</p>
            </div>
            <DashboardPage />
        </div>
    )
}

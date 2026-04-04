'use client'

import DashboardPage from '../page'

export default function SuperAdminDashboard() {
    return (
        <div className="space-y-6">
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-6">
                <p className="text-purple-400 text-sm font-semibold">Super Admin Mode Activated</p>
            </div>
            <DashboardPage />
        </div>
    )
}

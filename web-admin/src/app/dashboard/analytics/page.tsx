'use client'

import { TrendingUp, ShoppingCart, Users, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

const revenueData = {
  labels: months,
  datasets: [{
    label: 'Revenue (₦)',
    data: [1200000, 1850000, 2400000, 1950000, 2200000, 2841490],
    fill: true,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.8)',
    borderWidth: 2,
    tension: 0.4,
    pointBackgroundColor: 'rgba(139, 92, 246, 1)',
    pointRadius: 4,
  }]
}

const ordersData = {
  labels: months,
  datasets: [{
    label: 'Orders',
    data: [180, 240, 320, 210, 290, 340],
    backgroundColor: 'rgba(59, 130, 246, 0.7)',
    borderRadius: 6,
  }]
}

const topProductsData = {
  labels: ['Household', 'Kitchen', 'Cosmetics', 'Daily Needs', 'Phone Acc.', 'Oils', 'Humidifiers'],
  datasets: [{
    data: [28, 18, 22, 14, 8, 6, 4],
    backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'],
    borderWidth: 0,
  }]
}

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.05)' } } },
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Store performance overview — last 6 months</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: '₦12.4M', change: '+18.2%', up: true, icon: TrendingUp, color: 'text-purple-500' },
          { label: 'Total Orders', value: '1,580', change: '+12.5%', up: true, icon: ShoppingCart, color: 'text-blue-500' },
          { label: 'New Customers', value: '842', change: '+9.1%', up: true, icon: Users, color: 'text-green-500' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center gap-4">
            <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
            <div>
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className={`text-xs flex items-center gap-0.5 ${kpi.up ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Revenue Trend</h2>
          <Line data={revenueData} options={chartOptions} />
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Orders Overview</h2>
          <Bar data={ordersData} options={chartOptions} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Sales by Category</h2>
          <div className="flex items-center gap-6">
            <div className="w-48 h-48">
              <Doughnut data={topProductsData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
            <div className="space-y-2 flex-1">
              {topProductsData.labels.map((label, i) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: topProductsData.datasets[0].backgroundColor[i] }} />
                  <span className="text-muted-foreground flex-1">{label}</span>
                  <span className="font-semibold">{topProductsData.datasets[0].data[i]}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Conversion Rate Trend</h2>
          <div className="flex flex-col gap-3 mt-2">
            {months.map((m, i) => {
              const rate = [3.2, 4.1, 5.8, 4.2, 5.1, 6.3][i]
              return (
                <div key={m} className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground w-8">{m}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${rate * 10}%` }} />
                  </div>
                  <span className="font-semibold w-10 text-right">{rate}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

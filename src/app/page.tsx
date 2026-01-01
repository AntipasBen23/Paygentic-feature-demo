// src/app/page.tsx

'use client';

import { getDashboardStats, getRevenueLeakHeatmap, getChurnPredictions, formatCurrency, getRevenueTrend } from '@/lib/analytics';
import { useEffect, useState } from 'react';
import { RevenueChart } from '@/components/RevenueChart';

export default function Dashboard() {
  const [stats, setStats] = useState(getDashboardStats());
  const [leaks, setLeaks] = useState(getRevenueLeakHeatmap());
  const [churnPredictions, setChurnPredictions] = useState(getChurnPredictions(10));

  // Simulate loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-purple-400 text-xl font-semibold">Loading Pricing Intelligence...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-white font-bold text-lg">π</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
                  Paygentic PIE
                </h1>
                <p className="text-xs text-slate-400">Pricing Intelligence Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-sm text-slate-400">
                <span className="text-purple-400 font-semibold">50</span> Companies • 
                <span className="text-yellow-400 font-semibold ml-1">180</span> Days Data
              </div>
              <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-semibold text-purple-300">
                Demo Mode
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue Leak */}
          <MetricCard
            title="Revenue Leak"
            value={formatCurrency(stats.totalRevenueLeak)}
            subtitle={`${stats.totalRevenueLeakPercent.toFixed(1)}% of current revenue`}
            trend="up"
            color="yellow"
            icon="💸"
          />

          {/* Potential Revenue */}
          <MetricCard
            title="Potential Revenue"
            value={formatCurrency(stats.potentialRevenue)}
            subtitle={`vs ${formatCurrency(stats.monthlyRevenue)} current`}
            trend="up"
            color="purple"
            icon="📈"
          />

          {/* High Risk Customers */}
          <MetricCard
            title="High Churn Risk"
            value={stats.highRiskCustomers.toString()}
            subtitle={`${stats.avgChurnProbability.toFixed(0)}% avg probability`}
            trend="down"
            color="red"
            icon="⚠️"
          />

          {/* Optimization Score */}
          <MetricCard
            title="Optimization Score"
            value={`${(100 - stats.totalRevenueLeakPercent).toFixed(0)}%`}
            subtitle="Based on pricing efficiency"
            trend="neutral"
            color="green"
            icon="✨"
          />
        </div>

        {/* Revenue Chart */}
        <div className="mb-8">
          <RevenueChart />
        </div>

        {/* Revenue Leak Heatmap */}
        <section className="mb-8">
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                  🔥 Revenue Leak Detection
                </h2>
                <p className="text-sm text-slate-400">Companies ranked by revenue opportunity</p>
              </div>
              <div className="hidden lg:flex gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span className="text-slate-400">Critical (50%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-500"></div>
                  <span className="text-slate-400">High (30-50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500"></div>
                  <span className="text-slate-400">Medium (15-30%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-slate-400">Low (&lt;15%)</span>
                </div>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {leaks.slice(0, 20).map((leak) => (
                <HeatmapCell key={leak.companyId} leak={leak} />
              ))}
            </div>

            <div className="mt-6 text-center">
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors">
                View All {leaks.length} Companies →
              </button>
            </div>
          </div>
        </section>

        {/* Churn Predictions */}
        <section>
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                🎯 Churn Risk Alerts
              </h2>
              <p className="text-sm text-slate-400">Customers likely to churn with AI-powered recommendations</p>
            </div>

            <div className="space-y-3">
              {churnPredictions.map((prediction) => (
                <ChurnAlert key={prediction.companyId} prediction={prediction} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">
            Built by <span className="text-purple-400 font-semibold">Antipas Ben</span> • 
            Demo for <span className="text-yellow-400 font-semibold">Paygentic</span> • 
            Frontend-only architecture
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Production version would integrate with Paygentic API for real-time data
          </p>
        </div>
      </footer>
    </div>
  );
}

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  color,
  icon 
}: { 
  title: string;
  value: string;
  subtitle: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'yellow' | 'purple' | 'red' | 'green';
  icon: string;
}) {
  const colorClasses = {
    yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30 shadow-yellow-500/10',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 shadow-purple-500/10',
    red: 'from-red-500/20 to-red-600/5 border-red-500/30 shadow-red-500/10',
    green: 'from-green-500/20 to-green-600/5 border-green-500/30 shadow-green-500/10'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-lg p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl`}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-sm text-slate-400">{title}</div>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  );
}

// Heatmap Cell Component
function HeatmapCell({ leak }: { leak: ReturnType<typeof getRevenueLeakHeatmap>[0] }) {
  const severityColors = {
    critical: 'bg-red-500 hover:bg-red-400 shadow-red-500/50',
    high: 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/50',
    medium: 'bg-yellow-500 hover:bg-yellow-400 shadow-yellow-500/50',
    low: 'bg-green-500 hover:bg-green-400 shadow-green-500/50'
  };

  return (
    <div
      className={`${severityColors[leak.severity]} rounded-lg p-4 cursor-pointer transition-all hover:scale-105 hover:shadow-lg`}
      title={`${leak.companyName} - ${formatCurrency(leak.leakAmount)} leak`}
    >
      <div className="text-xs font-semibold text-white/90 mb-1 truncate">
        {leak.companyName}
      </div>
      <div className="text-xl font-bold text-white">
        {formatCurrency(leak.leakAmount)}
      </div>
      <div className="text-xs text-white/80 mt-1">
        {leak.leakPercent.toFixed(0)}% leak
      </div>
      <div className="text-xs text-white/60 mt-1 truncate">
        {leak.industry}
      </div>
    </div>
  );
}

// Churn Alert Component
function ChurnAlert({ prediction }: { prediction: ReturnType<typeof getChurnPredictions>[0] }) {
  const riskColors = {
    high: 'border-red-500/50 bg-red-500/10',
    medium: 'border-yellow-500/50 bg-yellow-500/10',
    low: 'border-green-500/50 bg-green-500/10'
  };

  const riskBadgeColors = {
    high: 'bg-red-500 text-white',
    medium: 'bg-yellow-500 text-slate-900',
    low: 'bg-green-500 text-white'
  };

  return (
    <div className={`border ${riskColors[prediction.risk]} rounded-lg p-4 hover:shadow-lg transition-all hover:border-opacity-100`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="font-semibold text-white mb-1">{prediction.companyName}</div>
          <div className="text-sm text-slate-400">{prediction.reason}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{prediction.probability}%</div>
            <div className="text-xs text-slate-500">churn risk</div>
          </div>
          <div className={`${riskBadgeColors[prediction.risk]} px-3 py-1 rounded text-xs font-bold uppercase`}>
            {prediction.risk}
          </div>
        </div>
      </div>
      <div className="bg-slate-800/50 rounded p-3 border-l-4 border-purple-500">
        <div className="text-xs text-purple-400 font-semibold mb-1">💡 AI Recommendation</div>
        <div className="text-sm text-slate-300">{prediction.recommendation}</div>
      </div>
    </div>
  );
}
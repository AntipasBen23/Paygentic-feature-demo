// src/components/RevenueChart.tsx

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getRevenueTrend, formatCurrency } from '@/lib/analytics';
import { useEffect, useState } from 'react';

interface RevenueChartProps {
  companyId?: string;
  title?: string;
}

export function RevenueChart({ companyId, title = "Revenue Trend (Last 90 Days)" }: RevenueChartProps) {
  const [data, setData] = useState<Array<{ date: string; revenue: number }>>([]);

  useEffect(() => {
    const trendData = getRevenueTrend(companyId);
    // Format dates for display
    const formattedData = trendData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.round(item.revenue)
    }));
    setData(formattedData);
  }, [companyId]);

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#a855f7" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: '#a855f7' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { mockOilTypeBreakdown } from '@/lib/mock-data';

// BACKEND INTEGRATION: GET /api/seller/collections/by-oil-type

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { oilType: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-card-lg">
      <p className="text-xs font-semibold text-foreground mb-1">{payload[0].payload.oilType} Oil</p>
      <p className="text-xs text-muted-foreground">
        Collected:{' '}
        <span className="font-mono-data font-bold text-foreground">
          {payload[0].value.toLocaleString('en-IN')} L
        </span>
      </p>
    </div>
  );
}

export default function OilTypeBreakdownChart() {
  return (
    <div className="card p-5 h-full">
      <div className="mb-5">
        <h3 className="font-bold text-foreground text-base">By Oil Type</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Lifetime collection breakdown</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={mockOilTypeBreakdown}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          barSize={28}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="oilType"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            width={38}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.5 }} />
          <Bar dataKey="liters" radius={[6, 6, 0, 0]}>
            {mockOilTypeBreakdown.map((entry, index) => (
              <Cell key={`cell-oiltype-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-4">
        {mockOilTypeBreakdown.map((item) => (
          <div key={`legend-${item.oilType}`} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            <span>{item.oilType}</span>
            <span className="font-mono-data font-medium text-foreground">
              {(item.liters / 1000).toFixed(1)}K L
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
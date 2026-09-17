'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockSustainabilityTimeline } from '@/lib/mock-data';

// BACKEND INTEGRATION: GET /api/seller/collections/timeline?range=12months

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-card-lg">
      <p className="text-xs font-semibold text-foreground mb-2">{label} 2025–26</p>
      {payload.map((entry, i) => (
        <div key={`tooltip-entry-${i}`} className="flex items-center gap-2 text-xs">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: entry.dataKey === 'ucoCollectedLiters' ? 'var(--chart-1)' : 'var(--chart-3)' }}
          />
          <span className="text-muted-foreground">
            {entry.dataKey === 'ucoCollectedLiters' ? 'UCO Collected' : 'CO₂ Offset'}:
          </span>
          <span className="font-mono-data font-semibold text-foreground">
            {entry.value.toLocaleString('en-IN')}
            {entry.dataKey === 'ucoCollectedLiters' ? ' L' : ' kg'}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function UCOCollectionChart() {
  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-foreground text-base">UCO Collection Volume</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Monthly liters collected — Oct 2025 to Sep 2026</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--chart-1)' }} />
            <span className="text-muted-foreground">UCO (L)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--chart-3)' }} />
            <span className="text-muted-foreground">CO₂ (kg)</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={mockSustainabilityTimeline} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gradUCO" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCO2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="ucoCollectedLiters"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#gradUCO)"
            dot={false}
            activeDot={{ r: 5, fill: 'var(--chart-1)', strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="co2OffsetKg"
            stroke="var(--chart-3)"
            strokeWidth={2}
            fill="url(#gradCO2)"
            dot={false}
            activeDot={{ r: 5, fill: 'var(--chart-3)', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
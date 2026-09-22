'use client';

import React, { useEffect, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { sellerApi, type SellerTimeline } from '@/lib/seller-api';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-card-lg text-xs">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={`sus-tooltip-${i}`} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">
            {entry.dataKey === 'ucoCollectedLiters' ? 'UCO' : entry.dataKey === 'co2OffsetKg' ? 'CO₂' : 'Collections'}:
          </span>
          <span className="font-mono-data font-semibold text-foreground">
            {entry.value.toLocaleString('en-IN')}
            {entry.dataKey === 'ucoCollectedLiters' ? ' L' : entry.dataKey === 'co2OffsetKg' ? ' kg' : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SustainabilityChart() {
  const [timeline,setTimeline]=useState<SellerTimeline[]>([]);useEffect(()=>{sellerApi.dashboard().then(x=>setTimeline(x.timeline)).catch(()=>setTimeline([]))},[]);
  return (
    <div className="card p-5">
      <div className="mb-5">
        <h3 className="font-bold text-foreground text-base">Monthly Impact Breakdown</h3>
        <p className="text-xs text-muted-foreground mt-0.5">UCO collected (bars) vs CO₂ offset trend (line) — rolling 12 months</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={timeline} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={40} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={44} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: 'var(--muted-foreground)' }}
            formatter={(value) =>
              value === 'ucoCollectedLiters' ? 'UCO Collected (L)' : value === 'co2OffsetKg' ? 'CO₂ Offset (kg)' : 'Collections'
            }
          />
          <Bar yAxisId="left" dataKey="ucoCollectedLiters" fill="var(--chart-1)" radius={[4, 4, 0, 0]} opacity={0.85} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="co2OffsetKg"
            stroke="var(--chart-3)"
            strokeWidth={2.5}
            dot={{ fill: 'var(--chart-3)', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: 'var(--chart-3)', strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

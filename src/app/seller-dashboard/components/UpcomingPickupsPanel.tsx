'use client';

import React from 'react';
import { Truck, Calendar, ArrowRight } from 'lucide-react';
import { mockPickups } from '@/lib/mock-data';

// BACKEND INTEGRATION: GET /api/seller/pickups?status=Scheduled,Assigned&limit=3

function getPickupStatusStyle(status: string) {
  const map: Record<string, string> = {
    Pending: 'badge-muted',
    Scheduled: 'badge-pending',
    Assigned: 'badge-info',
    'In Transit': 'badge-pending',
    'Picked Up': 'badge-active',
    Completed: 'badge-active',
  };
  return map[status] || 'badge-muted';
}

interface Props {
  onNavigate: (id: string) => void;
}

export default function UpcomingPickupsPanel({ onNavigate }: Props) {
  const upcoming = mockPickups.filter((p) => p.status !== 'Completed');

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Truck size={16} className="text-primary" />
          <h3 className="font-bold text-foreground text-sm">Upcoming Pickups</h3>
        </div>
        <button
          onClick={() => onNavigate('pickups')}
          className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
        >
          All <ArrowRight size={12} />
        </button>
      </div>

      <div className="divide-y divide-border">
        {upcoming.map((pickup) => (
          <div key={`pickup-card-${pickup.id}`} className="px-4 py-3 hover:bg-muted/40 transition-colors duration-100">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="font-mono-data text-xs font-semibold text-foreground">{pickup.id}</span>
              <span className={getPickupStatusStyle(pickup.status)}>{pickup.status}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Calendar size={11} />
              <span>{pickup.scheduledDate}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Agent: <span className="text-foreground font-medium">{pickup.agentName}</span>
              {' · '}
              <span className="font-mono-data">{pickup.vehicleNumber}</span>
            </div>
            {pickup.notes && (
              <p className="text-xs text-muted-foreground mt-1 italic">{pickup.notes}</p>
            )}
          </div>
        ))}

        {upcoming.length === 0 && (
          <div className="px-4 py-6 text-center">
            <Truck size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming pickups scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
}
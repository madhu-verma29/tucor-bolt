'use client';

import React, { useEffect, useState } from 'react';
import { Truck, Calendar, User, CheckCircle2, AlertTriangle } from 'lucide-react';
import { sellerApi, type SellerPickup as Pickup } from '@/lib/seller-api';


const PICKUP_STEPS: Pickup['status'][] = ['Pending', 'Scheduled', 'Assigned', 'In Transit', 'Picked Up', 'Completed'];

function PickupTimeline({ status }: { status: Pickup['status'] }) {
  const currentIdx = PICKUP_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0">
      {PICKUP_STEPS.map((step, i) => {
        const isDone = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <React.Fragment key={`pkp-step-${step}`}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  isDone ? 'bg-success text-white' : isCurrent ? 'bg-primary text-white ring-2 ring-primary/30' : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDone ? <CheckCircle2 size={10} /> : i + 1}
              </div>
              <span className={`text-xs w-14 text-center leading-tight ${isCurrent ? 'text-primary font-semibold' : isDone ? 'text-success' : 'text-muted-foreground'}`}>
                {step}
              </span>
            </div>
            {i < PICKUP_STEPS.length - 1 && (
              <div className={`h-0.5 w-4 mb-4 flex-shrink-0 ${i < currentIdx ? 'bg-success' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function getPickupStatusBadge(status: Pickup['status']) {
  const map: Record<Pickup['status'], string> = {
    Pending: 'badge-muted',
    Scheduled: 'badge-pending',
    Assigned: 'badge-info',
    'In Transit': 'badge-pending',
    'Picked Up': 'badge-active',
    Completed: 'badge-active',
  };
  return map[status];
}

export default function PickupsSection() {
  const [pickupItems,setPickupItems]=useState<Pickup[]>([]);
  const [activePickupId, setActivePickupId] = useState<string | null>(null);
  useEffect(()=>{sellerApi.pickups().then(setPickupItems).catch(()=>setPickupItems([]))},[]);
  const nextScheduled=pickupItems.find(p=>p.status==='Scheduled');

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Pickups</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {pickupItems.length} total · {pickupItems.filter((p) => p.status !== 'Completed').length} upcoming
        </p>
      </div>

      {/* Upcoming alert */}
      {pickupItems.some((p) => p.status === 'Scheduled') && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-warning-bg border border-warning/30">
          <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-warning mb-0.5">Pickup reminder</div>
            <p className="text-xs text-warning/80">
              {nextScheduled?.id} is scheduled for {nextScheduled?.scheduledDate}. Ensure your UCO drums are accessible and labeled. Agent {nextScheduled?.agentName} will arrive as scheduled.
            </p>
          </div>
        </div>
      )}

      {/* Pickup cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {pickupItems.map((pickup) => (
          <div
            key={`pickup-card-${pickup.id}`}
            className={`card overflow-hidden transition-all duration-200 hover:shadow-card-hover cursor-pointer ${
              activePickupId === pickup.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActivePickupId(activePickupId === pickup.id ? null : pickup.id)}
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-primary" />
                <span className="font-mono-data text-sm font-bold text-foreground">{pickup.id}</span>
              </div>
              <span className={getPickupStatusBadge(pickup.status)}>{pickup.status}</span>
            </div>

            {/* Card body */}
            <div className="px-5 py-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-muted-foreground" />
                <span className="text-foreground font-medium">{pickup.scheduledDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-muted-foreground" />
                <span className="text-foreground">{pickup.agentName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck size={14} className="text-muted-foreground" />
                <span className="font-mono-data text-xs text-foreground">{pickup.vehicleNumber}</span>
              </div>
              {pickup.volumeConfirmed && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={14} className="text-success" />
                  <span className="text-success font-medium">{pickup.volumeConfirmed} L confirmed</span>
                </div>
              )}
              {pickup.notes && (
                <p className="text-xs text-muted-foreground italic bg-muted/50 rounded-lg px-3 py-2">
                  {pickup.notes}
                </p>
              )}

              {/* Timeline (expanded) */}
              {activePickupId === pickup.id && (
                <div className="pt-3 border-t border-border animate-fade-in-up overflow-x-auto">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Pickup Progress
                  </div>
                  <PickupTimeline status={pickup.status} />
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Order:{' '}
                <span className="font-mono-data font-semibold text-foreground">{pickup.orderId}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

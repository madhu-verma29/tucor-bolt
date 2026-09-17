'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Droplets, Wind, Building2, TrendingUp } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const counters = [
  {
    id: 'counter-uco',
    icon: Droplets,
    value: 2400000,
    suffix: 'L',
    label: 'UCO Recovered',
    sublabel: 'Total platform lifetime',
    color: 'text-primary',
    bg: 'bg-secondary',
  },
  {
    id: 'counter-co2',
    icon: Wind,
    value: 3360,
    suffix: ' T',
    label: 'CO₂ Offset',
    sublabel: 'Estimated equivalent',
    color: 'text-accent',
    bg: 'bg-green-pale',
  },
  {
    id: 'counter-biz',
    icon: Building2,
    value: 840,
    suffix: '+',
    label: 'Businesses',
    sublabel: 'Verified participants',
    color: 'text-earth',
    bg: 'bg-amber-light/20',
  },
  {
    id: 'counter-collections',
    icon: TrendingUp,
    value: 4200,
    suffix: '+',
    label: 'Collections',
    sublabel: 'Completed pickups',
    color: 'text-info',
    bg: 'bg-info-bg',
  },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  const formatted =
    target >= 1000000
      ? (count / 1000000).toFixed(1) + 'M'
      : target >= 1000
      ? (count / 1000).toFixed(count >= target ? 1 : 0) + 'K'
      : count.toString();

  return (
    <span ref={ref} className="font-mono-data text-4xl font-bold">
      {formatted}{suffix}
    </span>
  );
}

export default function ImpactCounters() {
  return (
    <section className="py-16 bg-background border-b border-border">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-10">
          <p className="section-label mb-2">Platform Impact</p>
          <h2 className="text-display-md text-foreground">
            Real Numbers. Real Impact.
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {counters.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="card p-6 flex flex-col gap-3 hover:shadow-card-hover transition-shadow duration-200"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <Icon size={20} className={item.color} />
                </div>
                <div className={item.color}>
                  <AnimatedCounter target={item.value} suffix={item.suffix} />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.sublabel}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
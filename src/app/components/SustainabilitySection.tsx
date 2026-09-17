'use client';

import React from 'react';
import { Leaf, Recycle, Zap, Globe } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const circularSteps = [
  { id: 'circ-kitchen', emoji: '🍳', label: 'Kitchen Cooking', sublabel: 'Oil used in food preparation' },
  { id: 'circ-waste', emoji: '🛢️', label: 'UCO Generated', sublabel: 'Stored safely on-site' },
  { id: 'circ-collection', emoji: '🚛', label: 'TUCOR Collection', sublabel: 'Verified pickup & transport' },
  { id: 'circ-processing', emoji: '⚗️', label: 'Processing', sublabel: 'Refining & quality testing' },
  { id: 'circ-biodiesel', emoji: '⛽', label: 'Biodiesel', sublabel: 'Renewable fuel production' },
  { id: 'circ-transport', emoji: '🚌', label: 'Clean Transport', sublabel: 'Powering vehicles & industry' },
];

const impactMetrics = [
  { id: 'impact-co2', icon: Leaf, value: '1.4 kg', label: 'CO₂ offset per liter of UCO recovered', color: 'text-accent', bg: 'bg-green-pale' },
  { id: 'impact-fuel', icon: Zap, value: '0.88 L', label: 'Biodiesel produced per liter of UCO', color: 'text-info', bg: 'bg-info-bg' },
  { id: 'impact-circular', icon: Recycle, value: '98%', label: 'UCO diverted from landfill or drain', color: 'text-primary', bg: 'bg-secondary' },
  { id: 'impact-global', icon: Globe, value: 'SDG 7', label: 'Aligned with UN Sustainable Energy Goal', color: 'text-earth', bg: 'bg-amber-light/20' },
];

export default function SustainabilitySection() {
  return (
    <section id="sustainability" className="py-20 bg-muted/40">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Circular Economy</p>
          <h2 className="text-display-md text-foreground mb-4">
            Closing the Loop on Cooking Oil
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every liter of UCO recovered through TUCOR avoids environmental contamination and becomes renewable fuel. This is circular economy in practice — not just in theory.
          </p>
        </div>

        {/* Circular flow */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-14">
          {circularSteps?.map((step, i) => (
            <div key={step?.id} className="relative">
              <div className="card p-4 text-center hover:shadow-card-hover transition-shadow duration-200">
                <div className="text-3xl mb-2">{step?.emoji}</div>
                <div className="text-xs font-bold text-foreground mb-1">{step?.label}</div>
                <div className="text-xs text-muted-foreground">{step?.sublabel}</div>
              </div>
              {i < circularSteps?.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-primary items-center justify-center">
                  <span className="text-white text-xs">→</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Impact metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {impactMetrics?.map((metric) => {
            const Icon = metric?.icon;
            return (
              <div key={metric?.id} className="card p-6 text-center hover:shadow-card-hover transition-shadow duration-200">
                <div className={`w-12 h-12 rounded-2xl ${metric?.bg} flex items-center justify-center mx-auto mb-4`}>
                  <Icon size={22} className={metric?.color} />
                </div>
                <div className={`font-mono-data text-2xl font-bold ${metric?.color} mb-2`}>{metric?.value}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{metric?.label}</p>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          * CO₂ offset estimates are based on IPCC lifecycle analysis for UCO-to-biodiesel conversion. Actual impact may vary by processing method.
        </p>
      </div>
    </section>
  );
}
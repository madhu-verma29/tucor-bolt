'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import Icon from '@/components/ui/AppIcon';


const options = [
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
  { value: 'system' as const, label: 'System', icon: Monitor },
];

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = options.find((o) => o.value === theme) || options[2];
  const Icon = current.icon;

  if (compact) {
    return (
      <button
        onClick={() => {
          const idx = options.findIndex((o) => o.value === theme);
          setTheme(options[(idx + 1) % options.length].value);
        }}
        className="p-2 rounded-xl hover:bg-muted transition-all duration-150 text-muted-foreground hover:text-foreground"
        aria-label="Toggle theme"
      >
        <Icon size={18} />
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-muted transition-all duration-150 text-muted-foreground hover:text-foreground text-sm font-medium"
      >
        <Icon size={16} />
        <span className="hidden sm:block">{current.label}</span>
        <ChevronDown size={14} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-36 bg-card border border-border rounded-xl shadow-card-lg z-50 overflow-hidden animate-fade-in-up">
          {options.map((opt) => {
            const OptIcon = opt.icon;
            return (
              <button
                key={`theme-opt-${opt.value}`}
                onClick={() => { setTheme(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-100 ${
                  theme === opt.value
                    ? 'bg-primary/10 text-primary font-semibold' :'text-foreground hover:bg-muted'
                }`}
              >
                <OptIcon size={15} />
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
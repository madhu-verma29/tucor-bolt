'use client';

import React from 'react';

interface Props {
  title: string;
  description: string;
  icon: string;
}

export default function AdminPlaceholderSection({ title, description, icon }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Admin Console · Platform Management</p>
      </div>
      <div className="card p-16 flex flex-col items-center justify-center text-center gap-4">
        <div className="text-5xl">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-md">{description}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-xl mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Full implementation available in production build
        </div>
      </div>
    </div>
  );
}

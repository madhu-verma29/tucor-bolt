import React from 'react';

interface Props {
  title: string;
  description: string;
  icon: string;
}

export default function PlaceholderSection({ title, description, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="text-6xl">{icon}</div>
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground max-w-md leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-4 py-2 rounded-xl">
        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        This section is available in the full TUCOR platform
      </div>
    </div>
  );
}
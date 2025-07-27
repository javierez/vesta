"use client";

interface AboutHeaderProps {
  title: string;
  subtitle: string;
}

export function AboutHeader({ title, subtitle }: AboutHeaderProps) {
  return (
    <div className="mb-12 flex flex-col items-center text-center">
      <h2 className="mb-4 text-4xl font-bold tracking-tight">{title}</h2>
      <p className="max-w-2xl text-muted-foreground">{subtitle}</p>
    </div>
  );
}

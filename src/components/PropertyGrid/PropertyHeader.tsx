"use client";

interface PropertyHeaderProps {
  title: string;
  subtitle: string;
}

export function PropertyHeader({ title, subtitle }: PropertyHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <h2 className="mb-2 text-3xl font-bold">{title}</h2>
      <p className="mx-auto max-w-2xl text-muted-foreground">{subtitle}</p>
    </div>
  );
}

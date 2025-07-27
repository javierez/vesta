"use client";

interface KpiData {
  name: string;
  data: string;
}

interface KpiSectionProps {
  kpis: KpiData[];
}

export function KpiSection({ kpis }: KpiSectionProps) {
  if (!kpis.length) return null;

  return (
    <div className="mt-24 grid grid-cols-2 gap-8 text-center md:grid-cols-4">
      {kpis.map((kpi, index) => (
        <div key={index} className="space-y-2">
          <h3 className="text-4xl font-bold text-primary">{kpi.data}</h3>
          <p className="text-muted-foreground">{kpi.name}</p>
        </div>
      ))}
    </div>
  );
}

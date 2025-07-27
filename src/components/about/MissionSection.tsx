"use client";

interface MissionSectionProps {
  title: string;
  content: string;
  content2: string;
}

export function MissionSection({
  title,
  content,
  content2,
}: MissionSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold">{title}</h3>
      <div className="space-y-4">
        <p className="leading-relaxed text-muted-foreground">{content}</p>
        <p className="leading-relaxed text-muted-foreground">{content2}</p>
      </div>
    </div>
  );
}

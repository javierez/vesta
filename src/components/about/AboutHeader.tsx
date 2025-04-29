"use client"

interface AboutHeaderProps {
  title: string
  subtitle: string
}

export function AboutHeader({ title, subtitle }: AboutHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center mb-12">
      <h2 className="text-4xl font-bold mb-4 tracking-tight">{title}</h2>
      <p className="text-muted-foreground max-w-2xl">{subtitle}</p>
    </div>
  )
} 
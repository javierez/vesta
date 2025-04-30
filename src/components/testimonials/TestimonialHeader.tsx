"use client"

interface TestimonialHeaderProps {
  title: string
  subtitle: string
}

export function TestimonialHeader({ title, subtitle }: TestimonialHeaderProps) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
    </div>
  )
} 
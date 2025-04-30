"use client"

import { Card, CardContent, CardFooter } from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Quote } from "lucide-react"

interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  avatar?: string
}

interface TestimonialCardProps {
  testimonial: Testimonial
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="relative flex h-full flex-col border-muted/30 transition-all duration-200 hover:shadow-md">
      {/* Decorative elements */}
      <Quote className="absolute top-4 right-4 h-8 w-8 text-muted-foreground/15" />
      <div className="absolute left-0 top-0 h-1 w-24 bg-gradient-to-r from-primary/40 to-primary/10" />

      {/* Content area with fixed spacing */}
      <CardContent className="flex-1 pt-8">
        <blockquote className="text-lg leading-relaxed text-muted-foreground">
          &ldquo;{testimonial.content}&rdquo;
        </blockquote>
      </CardContent>

      {/* Footer always positioned at the bottom */}
      <CardFooter className="mt-auto border-t border-muted/20 py-4">
        <div className="flex w-full items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
            <AvatarImage
              src={
                testimonial.avatar ||
                `/placeholder.svg?height=48&width=48&query=${encodeURIComponent(testimonial.name)}`
              }
              alt={testimonial.name}
            />
            <AvatarFallback className="bg-primary/5 text-primary">{testimonial.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium leading-none">{testimonial.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{testimonial.role}</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

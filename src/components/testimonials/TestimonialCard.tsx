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
    <Card className="relative">
      <Quote className="absolute top-4 right-4 h-8 w-8 text-muted-foreground/20" />

      <CardContent className="pt-6">
        <blockquote className="text-lg text-muted-foreground mb-4">
          &ldquo;{testimonial.content}&rdquo;
        </blockquote>
      </CardContent>

      <CardFooter className="flex items-center gap-4 pt-0">
        <Avatar>
          <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
        </div>
      </CardFooter>
    </Card>
  )
} 
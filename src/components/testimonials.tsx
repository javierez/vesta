"use client"

import { testimonials } from "~/lib/data"
import { Card, CardContent, CardFooter } from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Quote } from "lucide-react"

export function Testimonials() {
  return (
    <section className="py-16 container">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">Lo Que Dicen Nuestros Clientes</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          No solo tomes nuestra palabra. Escucha a algunos de nuestros clientes satisfechos.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="relative">
            <Quote className="absolute top-4 right-4 h-8 w-8 text-muted-foreground/20" />

            <CardContent className="pt-6">
              <p className="text-muted-foreground italic">"{testimonial.content}"</p>
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
        ))}
      </div>
    </section>
  )
}

import Image from "next/image"
import { StarRating } from "~/components/ui/star-rating"
import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"
import { getTestimonialProps } from "~/server/queries/testimonial"
import { getTestimonialReviews } from "~/server/queries/testimonial_reviews"
import { testimonials } from "~/server/db/schema"
import type { InferSelectModel } from "drizzle-orm"

type Testimonial = InferSelectModel<typeof testimonials>

interface ReviewsSectionProps {
  className?: string
  id?: string
}

export async function ReviewsSection({ className, id }: ReviewsSectionProps) {
  const testimonialProps = await getTestimonialProps()
  const reviews = await getTestimonialReviews()
  
  // Fallbacks in case data is missing
  const title = testimonialProps?.title || "Lo Que Dicen Nuestros Clientes"
  const subtitle = testimonialProps?.subtitle || "No solo tomes nuestra palabra. Escucha a algunos de nuestros clientes satisfechos."
  
  // Show only a subset of testimonials initially
  const displayedReviews = reviews.slice(0, testimonialProps?.itemsPerPage || 3)
  console.log("displayedReviews", displayedReviews)

  return (
    <section className={cn("py-16", className)} id={id}>
      <div className="container">
        <div className="text-center mb-12 ml-8 md:ml-12 lg:ml-16">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          {subtitle && <p className="max-w-2xl mx-auto text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ml-8 md:ml-12 lg:ml-16">
          {displayedReviews.map((testimonial: Testimonial) => (
            <div key={testimonial.testimonialId} className="p-6 rounded-lg bg-background shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div />
                <StarRating rating={testimonial.rating ?? 5} />
              </div>

              <blockquote className="mb-6 italic text-muted-foreground">&ldquo;{testimonial.content}&rdquo;</blockquote>

              <div className="flex items-center gap-3">
                {testimonial.avatar && (
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{testimonial.name}</p>
                    {testimonial.isVerified && (
                      <Badge variant="outline" className="text-xs">
                        Verificado
                      </Badge>
                    )}
                  </div>
                  {testimonial.role && (
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

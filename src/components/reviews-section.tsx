import { cn } from "~/lib/utils"
import { getTestimonialProps, getTestimonials } from "~/server/queries/testimonial"
import { testimonials } from "~/server/db/schema"
import type { InferSelectModel } from "drizzle-orm"
import { TestimonialCard } from "./testimonials/TestimonialCard"
import { TestimonialHeader } from "./testimonials/TestimonialHeader"

type Testimonial = InferSelectModel<typeof testimonials>

interface ReviewsSectionProps {
  className?: string
  id?: string
}

export async function ReviewsSection({ className, id }: ReviewsSectionProps) {
  const testimonialProps = await getTestimonialProps()
  const reviews = await getTestimonials()
  
  // Fallbacks in case data is missing
  const title = testimonialProps?.title || "Lo Que Dicen Nuestros Clientes"
  const subtitle = testimonialProps?.subtitle || "No solo tomes nuestra palabra. Escucha a algunos de nuestros clientes satisfechos."
  
  // Show only a subset of testimonials initially
  const displayedReviews = reviews.slice(0, testimonialProps?.itemsPerPage || 3)

  return (
    <section className={cn("py-16", className)} id={id}>
      <div className="container">
        <TestimonialHeader title={title} subtitle={subtitle} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ml-8 md:ml-12 lg:ml-16">
          {displayedReviews.map((testimonial: Testimonial) => (
            <TestimonialCard
              key={testimonial.testimonialId.toString()}
              testimonial={{
                id: testimonial.testimonialId.toString(),
                name: testimonial.name,
                role: testimonial.role ?? "",
                content: testimonial.content,
                avatar: testimonial.avatar ?? undefined
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

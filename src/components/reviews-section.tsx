import Image from "next/image"
import { StarRating } from "~/components/ui/star-rating"
import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"

export interface Review {
  id: string
  author: {
    name: string
    role?: string
    company?: string
    avatar?: string
    verified?: boolean
  }
  rating: number
  content: string
  companyLogo?: string
}

interface ReviewsSectionProps {
  title: string
  subtitle?: string
  reviews: Review[]
  className?: string
  id?: string
}

export function ReviewsSection({ title, subtitle, reviews, className, id }: ReviewsSectionProps) {
  return (
    <section className={cn("py-16 bg-muted", className)} id={id}>
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          {subtitle && <p className="max-w-2xl mx-auto text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.id} className="p-6 rounded-lg bg-background shadow-sm">
              <div className="flex justify-between items-start mb-4">
                {review.companyLogo ? (
                  <div className="h-10 relative w-32">
                    <Image
                      src={review.companyLogo || "/placeholder.svg"}
                      alt={review.author.company || ""}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div />
                )}
                <StarRating rating={review.rating} />
              </div>

              <blockquote className="mb-6 italic text-muted-foreground">"{review.content}"</blockquote>

              <div className="flex items-center gap-3">
                {review.author.avatar && (
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={review.author.avatar || "/placeholder.svg"}
                      alt={review.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{review.author.name}</p>
                    {review.author.verified && (
                      <Badge variant="outline" className="text-xs">
                        Verificado
                      </Badge>
                    )}
                  </div>
                  {(review.author.role || review.author.company) && (
                    <p className="text-sm text-muted-foreground">
                      {review.author.role}
                      {review.author.role && review.author.company && " / "}
                      {review.author.company}
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

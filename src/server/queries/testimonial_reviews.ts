import { db } from "../db"
import { testimonials } from "../db/schema"
import { desc, eq } from "drizzle-orm"

export async function getTestimonialReviews() {
  try {
    const reviews = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.isActive, true))
      .orderBy(desc(testimonials.sortOrder))
      .limit(6)

    return reviews
  } catch (error) {
    console.error("Error fetching testimonial reviews:", error)
    return []
  }
}

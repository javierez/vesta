import { db } from "../db"
import { websiteProperties, testimonials } from "../db/schema"
import { eq } from "drizzle-orm"
import { cache } from 'react'
import type { TestimonialProps } from "../../lib/data"

export const getTestimonialProps = cache(async (): Promise<TestimonialProps | null> => {
  'use server'
  try {
    const [config] = await db
      .select({ testimonialProps: websiteProperties.testimonialProps })
      .from(websiteProperties)
      .where(eq(websiteProperties.accountId, BigInt("1234")))
      .limit(1)
    
    console.log('Testimonial props data:', config?.testimonialProps)
    
    if (!config?.testimonialProps) return null
    return JSON.parse(config.testimonialProps) as TestimonialProps
  } catch (error) {
    console.error('Error fetching testimonial props:', error)
    return null
  }
})

export const getTestimonials = cache(async () => {
  'use server'
  try {
    const reviews = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.accountId, BigInt("1234")))
      .orderBy(testimonials.sortOrder)
    
    return reviews
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }
}) 
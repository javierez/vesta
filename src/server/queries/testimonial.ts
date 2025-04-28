import { db } from "../db"
import { websiteProperties } from "../db/schema"
import { eq } from "drizzle-orm"
import { cache } from 'react'
import type { TestimonialProps } from "../../lib/data"

export const getTestimonialProps = cache(async (): Promise<TestimonialProps | null> => {
  'use server'
  try {
    const [config] = await db
      .select({ testimonialProps: websiteProperties.testimonialProps })
      .from(websiteProperties)
      .where(eq(websiteProperties.id, BigInt("1125899906842629")))
      .limit(1)
    if (!config?.testimonialProps) return null
    return JSON.parse(config.testimonialProps) as TestimonialProps
  } catch (error) {
    console.error('Error fetching testimonial props:', error)
    return null
  }
}) 
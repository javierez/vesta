import { db } from "../db"
import { websiteProperties } from "../db/schema"
import { eq } from "drizzle-orm"
import { cache } from 'react'
import type { FeaturedProps } from "../../lib/data"

export const getFeaturedProps = cache(async (): Promise<FeaturedProps | null> => {
  'use server'
  try {
    const [config] = await db
      .select({ featuredProps: websiteProperties.featuredProps })
      .from(websiteProperties)
      .where(eq(websiteProperties.id, BigInt("1125899906842629")))
      .limit(1)
    if (!config?.featuredProps) return null
    return JSON.parse(config.featuredProps) as FeaturedProps
  } catch (error) {
    console.error('Error fetching featured props:', error)
    return null
  }
}) 
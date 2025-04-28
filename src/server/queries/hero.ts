import { db } from "../db"
import { websiteProperties } from "../db/schema"
import { eq } from "drizzle-orm"
import { cache } from 'react'
import type { HeroProps } from "../../lib/data"

// Using React cache to memoize the query
export const getHeroProps = cache(async (): Promise<HeroProps | null> => {
  'use server' // Mark this as a server function
  
  try {
    const [config] = await db
      .select({ heroProps: websiteProperties.heroProps })
      .from(websiteProperties)
      .where(eq(websiteProperties.id, BigInt("1125899906842629")))
      .limit(1)

    if (!config?.heroProps) {
      return null
    }
    console.log(config.heroProps)

    // heroProps is stored as JSON string, so parse it
    const heroProps = JSON.parse(config.heroProps) as HeroProps
    console.log("heroProps", heroProps)
    return heroProps
  } catch (error) {
    console.error('Error fetching hero props:', error)
    return null // Return null on error
  }
}) 
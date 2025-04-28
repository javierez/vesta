import { db } from "../db"
import { websiteProperties } from "../db/schema"
import { eq } from "drizzle-orm"
import { cache } from 'react'
import type { SeoProps } from "../../lib/data"

export const getSeoProps = cache(async (): Promise<SeoProps | null> => {
  'use server'
  try {
    const [config] = await db
      .select({ seoProps: websiteProperties.seoProps })
      .from(websiteProperties)
      .where(eq(websiteProperties.id, BigInt("1125899906842629")))
      .limit(1)
    if (!config?.seoProps) return null
    return JSON.parse(config.seoProps) as SeoProps
  } catch (error) {
    console.error('Error fetching seo props:', error)
    return null
  }
}) 
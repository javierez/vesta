import { db } from "../db"
import { websiteProperties } from "../db/schema"
import { eq } from "drizzle-orm"
import { cache } from 'react'
import type { AboutProps } from "../../lib/data"

export const getAboutProps = cache(async (): Promise<AboutProps | null> => {
  'use server'
  try {
    const [config] = await db
      .select({ aboutProps: websiteProperties.aboutProps })
      .from(websiteProperties)
      .where(eq(websiteProperties.id, BigInt("1125899906842628")))
      .limit(1)
    if (!config?.aboutProps) return null
    return JSON.parse(config.aboutProps) as AboutProps
  } catch (error) {
    console.error('Error fetching about props:', error)
    return null
  }
}) 
import { db } from "../db"
import { websiteProperties } from "../db/schema"
import { eq } from "drizzle-orm"
import { cache } from 'react'
import type { HeadProps } from "../../lib/data"

export const getHeadProps = cache(async (): Promise<HeadProps | null> => {
  'use server'
  try {
    const [config] = await db
      .select({ headProps: websiteProperties.headProps })
      .from(websiteProperties)
      .where(eq(websiteProperties.id, BigInt("1125899906842629")))
      .limit(1)
    if (!config?.headProps) return null
    return JSON.parse(config.headProps) as HeadProps
  } catch (error) {
    console.error('Error fetching head props:', error)
    return null
  }
}) 
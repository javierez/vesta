import { db } from "../db"
import { websiteProperties } from "../db/schema"
import { eq } from "drizzle-orm"
import { cache } from 'react'
import type { PropertiesProps } from "../../lib/data"

export const getPropertiesProps = cache(async (): Promise<PropertiesProps | null> => {
  'use server'
  try {
    const [config] = await db
      .select({ propertiesProps: websiteProperties.propertiesProps })
      .from(websiteProperties)
      .where(eq(websiteProperties.id, BigInt("2251799813685253")))
      .limit(1)
    if (!config?.propertiesProps) return null
    return JSON.parse(config.propertiesProps) as PropertiesProps
  } catch (error) {
    console.error('Error fetching properties props:', error)
    return null
  }
}) 
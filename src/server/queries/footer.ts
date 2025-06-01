'use server'

import { db } from "../db"
import { websiteProperties } from "../db/schema"
import { eq } from "drizzle-orm"
import type { FooterProps } from "../../lib/data"

export async function getFooterProps(): Promise<FooterProps | null> {
  try {
    const [config] = await db
      .select({ footerProps: websiteProperties.footerProps })
      .from(websiteProperties)
      .where(eq(websiteProperties.id, BigInt("1125899906842637")))
      .limit(1)
    if (!config?.footerProps) return null
    return JSON.parse(config.footerProps) as FooterProps
  } catch (error) {
    console.error('Error fetching footer props:', error)
    return null
  }
} 
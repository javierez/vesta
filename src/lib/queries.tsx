import { db } from "~/server/db"
import { websiteProperties } from "~/server/db/schema"
import { eq } from "drizzle-orm"
import { cache } from 'react'

export type SocialPlatform = "facebook" | "instagram" | "twitter" | "linkedin" | "youtube"
export type SocialLink = { platform: SocialPlatform; url: string }

// Using React cache to memoize the query
export const getSocialLinks = cache(async (): Promise<SocialLink[]> => {
  const [config] = await db
    .select({ socialLinks: websiteProperties.socialLinks })
    .from(websiteProperties)
    .where(eq(websiteProperties.accountId, BigInt("1234")))
    .limit(1)

  if (!config?.socialLinks) {
    return []
  }

  const socialLinksObj = JSON.parse(config.socialLinks) as Record<string, string>
  
  return Object.entries(socialLinksObj).map(([platform, url]) => ({
    platform: platform as SocialPlatform,
    url
  }))
}) 
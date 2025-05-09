'use server'

import { db } from "../db"
import { websiteProperties } from "../db/schema"
import { eq } from "drizzle-orm"
import { cache } from 'react'

export type ContactProps = {
  title: string
  subtitle: string
  messageForm: boolean
  address: boolean
  phone: boolean
  mail: boolean
  schedule: boolean
  map: boolean
  // Contact information fields
  officeAddress?: {
    street: string
    city: string
    state: string
    country: string
  }
  phoneNumbers?: {
    main: string
    sales: string
  }
  emailAddresses?: {
    info: string
    sales: string
  }
  scheduleInfo?: {
    weekdays: string
    saturday: string
    sunday: string
  }
  mapUrl?: string
}

export const getContactProps = cache(async (): Promise<ContactProps | null> => {
  try {
    const [config] = await db
      .select({ contactProps: websiteProperties.contactProps })
      .from(websiteProperties)
      .where(eq(websiteProperties.id, BigInt("1125899906842635")))
      .limit(1)
    
    if (!config?.contactProps) return null
    return JSON.parse(config.contactProps) as ContactProps
  } catch (error) {
    console.error('Error fetching contact props:', error)
    return null
  }
}) 
import { db } from "../db"
import { accounts } from "../db/schema"
import { eq } from "drizzle-orm"
import { cache } from 'react'

export type AccountInfo = {
  accountId: string
  name: string
  shortName: string
  status: string
  subscriptionType: string
}

export const getAccountInfo = cache(async (accountId: string): Promise<AccountInfo | null> => {
  'use server'
  console.log("accountId: ", BigInt(accountId))
  
  try {
    const [account] = await db
      .select({
        accountId: accounts.accountId,
        name: accounts.name,
        shortName: accounts.shortName,
        status: accounts.status,
        subscriptionType: accounts.subscriptionType,
      })
      .from(accounts)
      .where(eq(accounts.accountId, BigInt(accountId)))
      .limit(1)

    if (!account) {
      return null
    }
    console.log("account info: ", account)

    return {
      accountId: account.accountId.toString(),
      name: account.name,
      shortName: account.shortName,
      status: account.status,
      subscriptionType: account.subscriptionType,
    }

  } catch (error) {
    console.error('Error fetching account info:', error)
    return null
  }
}) 
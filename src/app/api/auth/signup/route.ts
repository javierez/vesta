import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { accounts, users } from '~/server/db/schema';
import { auth } from '~/lib/auth';
import { eq } from 'drizzle-orm';

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();
    
    // Validate required fields
    if (!body.firstName?.trim()) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }
    if (!body.lastName?.trim()) {
      return NextResponse.json({ error: 'Last name is required' }, { status: 400 });
    }
    if (!body.email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!body.password || body.password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (!body.companyName?.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // 1. Create the account (organization) first
    const [newAccount] = await db
      .insert(accounts)
      .values({
        name: body.companyName.trim(),
        email: body.email.toLowerCase(), // Use signup email as account contact
      })
      .$returningId();

    if (!newAccount) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    // 2. Use BetterAuth to create the user
    let authResult;
    try {
      authResult = await auth.api.signUpEmail({
        body: {
          email: body.email.toLowerCase(),
          password: body.password,
          name: body.firstName.trim(), // BetterAuth expects 'name'
          lastName: body.lastName.trim(),
        },
      });

      if (!authResult || !authResult.user) {
        throw new Error('Failed to create user account');
      }

      // 3. Update the user with accountId after creation
      await db
        .update(users)
        .set({ accountId: BigInt(newAccount.accountId) })
        .where(eq(users.userId, BigInt(authResult.user.id)));

    } catch (authError) {
      // Clean up the account if user creation fails
      await db.delete(accounts).where(eq(accounts.accountId, newAccount.accountId));
      
      return NextResponse.json({ 
        error: authError instanceof Error ? authError.message : 'Failed to create user account' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Account and user created successfully',
      accountId: newAccount.accountId,
      userId: authResult.user.id,
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
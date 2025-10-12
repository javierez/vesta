import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { db } from "~/server/db";
import { accounts } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Get accountId from session
    const accountId = session.user.accountId as bigint | undefined;
    if (!accountId) {
      return NextResponse.json(
        { error: "No se encontró la cuenta del usuario" },
        { status: 400 }
      );
    }

    // Parse request body
    const formData = await request.json();

    console.log("📝 [Onboarding API] Received data for accountId:", accountId);
    console.log("📋 [Onboarding API] Form data:", formData);

    // Build onboarding data object
    const onboardingData = {
      completed: true,
      completedAt: new Date().toISOString(),
      previousCrm: formData.previousCrm,
      referralSource: formData.referralSource,
      teamSize: formData.teamSize,
      businessFocus: formData.businessFocus,
      monthlyListings: formData.monthlyListings,
      biggestChallenge: formData.biggestChallenge,
      email: formData.email,
      website: {
        has: formData.hasWebsite ?? false,
        url: formData.websiteUrl,
      },
      websiteDomain: {
        has: formData.hasWebsiteDomain ?? false,
        name: formData.websiteDomainName,
        managedByUs: formData.websiteDomainManaged ?? false,
      },
      emailDomain: {
        has: formData.hasEmailDomain ?? false,
        name: formData.emailDomainName,
        managedByUs: formData.emailDomainManaged ?? false,
      },
      portals: {
        idealista: formData.usesIdealista ?? false,
        fotocasa: formData.usesFotocasa ?? false,
        habitaclia: formData.usesHabitaclia ?? false,
      },
      additionalNotes: formData.additionalNotes,
    };

    console.log("💾 [Onboarding API] Saving onboarding data:", onboardingData);

    // Update account with onboarding data
    await db
      .update(accounts)
      .set({
        onboardingData: onboardingData,
        updatedAt: new Date(),
      })
      .where(eq(accounts.accountId, accountId));

    console.log("✅ [Onboarding API] Onboarding data saved successfully");

    return NextResponse.json({
      success: true,
      message: "Onboarding completado exitosamente",
    });
  } catch (error) {
    console.error("❌ [Onboarding API] Error:", error);
    return NextResponse.json(
      {
        error: "Error al guardar los datos de onboarding",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}


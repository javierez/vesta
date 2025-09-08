import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { feedback } from "~/server/db/schema";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Get the session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { scale, feedbackComment } = body;

    // Validate input
    if (!scale || !feedbackComment) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    if (scale < 1 || scale > 4) {
      return NextResponse.json(
        { error: "La calificación debe estar entre 1 y 4" },
        { status: 400 }
      );
    }

    if (typeof feedbackComment !== "string" || feedbackComment.trim().length === 0) {
      return NextResponse.json(
        { error: "El comentario es obligatorio" },
        { status: 400 }
      );
    }

    // Get accountId from session (assuming it's available in the session)
    const accountId = session.user.accountId;
    
    if (!accountId) {
      return NextResponse.json(
        { error: "No se pudo obtener la información de la cuenta" },
        { status: 400 }
      );
    }

    // Insert feedback into database
    await db.insert(feedback).values({
      userId: session.user.id,
      accountId: BigInt(accountId),
      feedbackComment: feedbackComment.trim(),
      scale: scale,
    });

    return NextResponse.json(
      { message: "Feedback enviado correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
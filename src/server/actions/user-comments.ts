"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../../lib/dal";
import {
  createUserComment,
  updateUserComment,
  deleteUserComment,
  getUserCommentByIdWithAuth,
  type CreateUserCommentFormData,
  type UpdateUserCommentFormData,
  type UserCommentActionResult,
} from "../queries/user-comments";

export async function createUserCommentAction(
  formData: CreateUserCommentFormData,
): Promise<UserCommentActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "No tienes permisos para crear comentarios" };
    }

    // Validate input
    if (!formData.content?.trim()) {
      return { success: false, error: "El contenido del comentario no puede estar vacío" };
    }

    if (!formData.contactId) {
      return { success: false, error: "ID de contacto requerido" };
    }

    // Convert string IDs to BigInt if needed
    const contactId = typeof formData.contactId === "string" 
      ? BigInt(formData.contactId) 
      : formData.contactId;
    
    const parentId = formData.parentId 
      ? (typeof formData.parentId === "string" ? BigInt(formData.parentId) : formData.parentId)
      : null;

    const comment = await createUserComment(
      {
        contactId,
        userId: currentUser.id,
        content: formData.content.trim(),
        parentId,
      },
      Number(currentUser.accountId),
    );

    // Revalidate the contact page to show new comment
    revalidatePath(`/contactos/${contactId}`);
    
    return { 
      success: true, 
      data: {
        commentId: BigInt(comment.commentId),
        contactId: BigInt(comment.contactId),
        userId: comment.userId,
        content: comment.content,
        parentId: comment.parentId ? BigInt(comment.parentId) : null,
        isDeleted: comment.isDeleted,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      }
    };
  } catch (error) {
    console.error("Error in createUserCommentAction:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error interno del servidor" 
    };
  }
}

export async function updateUserCommentAction(
  formData: UpdateUserCommentFormData,
): Promise<UserCommentActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "No tienes permisos para editar comentarios" };
    }

    // Validate input
    if (!formData.content?.trim()) {
      return { success: false, error: "El contenido del comentario no puede estar vacío" };
    }

    if (!formData.commentId) {
      return { success: false, error: "ID de comentario requerido" };
    }

    // Convert string ID to BigInt if needed
    const commentId = typeof formData.commentId === "string" 
      ? BigInt(formData.commentId) 
      : formData.commentId;

    // Verify the comment exists and belongs to the current user
    const existingComment = await getUserCommentByIdWithAuth(commentId);
    if (!existingComment) {
      return { success: false, error: "Comentario no encontrado" };
    }

    if (existingComment.userId !== currentUser.id) {
      return { success: false, error: "Solo puedes editar tus propios comentarios" };
    }

    await updateUserComment(
      commentId,
      formData.content.trim(),
      Number(currentUser.accountId),
    );

    // Revalidate the contact page to show updated comment
    revalidatePath(`/contactos/${existingComment.contactId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error in updateUserCommentAction:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error interno del servidor" 
    };
  }
}

export async function deleteUserCommentAction(commentId: bigint): Promise<UserCommentActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "No tienes permisos para eliminar comentarios" };
    }

    // Verify the comment exists and belongs to the current user
    const existingComment = await getUserCommentByIdWithAuth(commentId);
    if (!existingComment) {
      return { success: false, error: "Comentario no encontrado" };
    }

    if (existingComment.userId !== currentUser.id) {
      return { success: false, error: "Solo puedes eliminar tus propios comentarios" };
    }

    await deleteUserComment(commentId, Number(currentUser.accountId));

    // Revalidate the contact page to hide deleted comment
    revalidatePath(`/contactos/${existingComment.contactId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error in deleteUserCommentAction:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error interno del servidor" 
    };
  }
}

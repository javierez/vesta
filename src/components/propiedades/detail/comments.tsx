"use client";

import { useState, useOptimistic, useTransition, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent } from "~/components/ui/card";
import { MessageCircle, Reply, Edit2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import type { CommentWithUser } from "~/types/comments";
import { createCommentAction, updateCommentAction, deleteCommentAction } from "~/server/actions/comments";
import { ConfirmDialog } from "~/components/ui/confirm-dialog";


interface CommentsProps {
  propertyId: bigint;
  listingId: bigint;
  referenceNumber: string;
  initialComments?: CommentWithUser[];
  currentUserId?: string;
  currentUser?: {
    id: string;
    name?: string;
    image?: string;
  };
}

interface CommentItemProps {
  comment: CommentWithUser;
  isReply?: boolean;
  currentUserId?: string;
  replyingTo: bigint | null;
  setReplyingTo: (id: bigint | null) => void;
  replyContents: Record<string, string>;
  setReplyContents: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  editingComment: bigint | null;
  setEditingComment: (id: bigint | null) => void;
  editContent: string;
  setEditContent: (content: string) => void;
  isPending: boolean;
  isDeleting: boolean;
  handleAddReply: (parentId: bigint) => Promise<void>;
  handleEditComment: (commentId: bigint) => Promise<void>;
  handleDeleteComment: (commentId: bigint) => Promise<void>;
  startEditingComment: (comment: CommentWithUser) => void;
  cancelEditing: () => void;
  setCommentToDelete: (id: bigint | null) => void;
  setDeleteConfirmOpen: (open: boolean) => void;
}

function CommentItem({ 
  comment, 
  isReply = false, 
  currentUserId,
  replyingTo,
  setReplyingTo,
  replyContents,
  setReplyContents,
  editingComment,
  setEditingComment,
  editContent,
  setEditContent,
  isPending,
  isDeleting,
  handleAddReply,
  handleEditComment,
  handleDeleteComment,
  startEditingComment,
  cancelEditing,
  setCommentToDelete,
  setDeleteConfirmOpen
}: CommentItemProps) {
  return (
    <div className={`${isReply ? 'ml-12 pl-4' : ''}`}>
      <div className="flex space-x-3">
        <Avatar className={`${isReply ? 'h-8 w-8' : 'h-10 w-10'}`}>
          <AvatarImage src={comment.user.image ?? undefined} />
          <AvatarFallback className={`${isReply ? 'text-xs' : 'text-sm'}`}>
            {comment.user.initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className={`rounded-2xl px-4 py-3 relative group ${
            comment.userId === "temp" ? "opacity-70 bg-blue-50 shadow-sm" : 
            isReply ? "bg-white shadow-sm" : "bg-gray-50 shadow-md"
          }`}>
            {/* Action buttons - top right */}
            <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isReply && (
                <button
                  onClick={() => {
                    if (replyingTo === comment.commentId) {
                      setReplyingTo(null);
                      setReplyContents(prev => ({ ...prev, [comment.commentId.toString()]: "" }));
                    } else {
                      setReplyingTo(comment.commentId);
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                  title="Responder"
                >
                  <Reply className="h-3 w-3" />
                </button>
              )}
              
              {currentUserId === comment.userId && editingComment !== comment.commentId && (
                <>
                  <button
                    onClick={() => startEditingComment(comment)}
                    className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  
                  <button
                    onClick={() => {
                      setCommentToDelete(comment.commentId);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-2 pr-16">
              <span className={`font-semibold ${isReply ? 'text-xs' : 'text-sm'}`}>
                {comment.user.name}
              </span>
              {comment.userId === "temp" && (
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              )}
              <span className={`text-gray-500 ${isReply ? 'text-xs' : 'text-xs'}`}>
                {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: es })}
              </span>
            </div>
            {editingComment === comment.commentId ? (
              <div className="mt-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px] resize-none"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleEditComment(comment.commentId)}
                    disabled={!editContent.trim()}
                  >
                    Guardar
                  </Button>
                </div>
              </div>
            ) : (
              <p className={`mt-1 text-gray-900 ${isReply ? 'text-xs' : 'text-sm'}`}>
                {comment.content}
              </p>
            )}
          </div>
          
          {replyingTo === comment.commentId && (
            <div className="mt-3 flex space-x-3">
              <div className="flex-1">
                <Textarea
                  placeholder={`Responder a ${comment.user.name}...`}
                  value={replyContents[comment.commentId.toString()] ?? ""}
                  onChange={(e) => setReplyContents(prev => ({ ...prev, [comment.commentId.toString()]: e.target.value }))}
                  className="min-h-[60px] resize-none border-gray-200"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContents(prev => ({ ...prev, [comment.commentId.toString()]: "" }));
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAddReply(comment.commentId)}
                    disabled={!(replyContents[comment.commentId.toString()] ?? "").trim()}
                  >
                    Responder
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem 
                  key={reply.commentId.toString()} 
                  comment={reply} 
                  isReply={true} 
                  currentUserId={currentUserId}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContents={replyContents}
                  setReplyContents={setReplyContents}
                  editingComment={editingComment}
                  setEditingComment={setEditingComment}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  isPending={isPending}
                  isDeleting={isDeleting}
                  handleAddReply={handleAddReply}
                  handleEditComment={handleEditComment}
                  handleDeleteComment={handleDeleteComment}
                  startEditingComment={startEditingComment}
                  cancelEditing={cancelEditing}
                  setCommentToDelete={setCommentToDelete}
                  setDeleteConfirmOpen={setDeleteConfirmOpen}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Comments({ propertyId, listingId, referenceNumber: _referenceNumber, initialComments = [], currentUserId, currentUser }: CommentsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<bigint | null>(null);
  
  // Background queue for processing server requests
  const [processingQueue, setProcessingQueue] = useState<Set<string>>(new Set());
  
  // Generate initials from user name
  const getCurrentUserInitials = () => {
    if (!currentUser?.name) return "UA";
    const parts = currentUser.name.split(' ').filter(p => p.length > 0);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    } else if (parts.length === 1 && parts[0]) {
      return parts[0].charAt(0).toUpperCase();
    }
    return "UA";
  };
  
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, action: { 
      type: string; 
      comment?: CommentWithUser; 
      commentId?: string; 
      updatedComment?: CommentWithUser;
      parentId?: string;
      reply?: CommentWithUser;
      content?: string;
    }) => {
      switch (action.type) {
        case 'ADD_COMMENT':
          return action.comment ? [action.comment, ...state] : state;
        
        case 'ADD_REPLY':
          return state.map(comment => {
            if (comment.commentId.toString() === action.parentId && action.reply) {
              return {
                ...comment,
                replies: [...comment.replies, action.reply]
              };
            }
            return comment;
          });
        
        case 'UPDATE_COMMENT':
          if (action.content && action.commentId) {
            return state.map(comment => {
              if (comment.commentId.toString() === action.commentId) {
                return { ...comment, content: action.content! };
              }
              // Also check replies
              return {
                ...comment,
                replies: comment.replies.map(reply => 
                  reply.commentId.toString() === action.commentId 
                    ? { ...reply, content: action.content! }
                    : reply
                )
              };
            });
          }
          return state;
        
        case 'DELETE_COMMENT':
          return state.filter(c => c.commentId.toString() !== action.commentId);
        
        case 'DELETE_REPLY':
          return state.map(comment => ({
            ...comment,
            replies: comment.replies.filter(reply => 
              reply.commentId.toString() !== action.commentId
            )
          }));
        
        default:
          return state;
      }
    }
  );
  
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<bigint | null>(null);
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [editingComment, setEditingComment] = useState<bigint | null>(null);
  const [editContent, setEditContent] = useState("");


  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const tempComment: CommentWithUser = {
      commentId: BigInt(Date.now()),
      listingId,
      propertyId,
      userId: currentUserId ?? "temp",
      content: newComment,
      parentId: null,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: currentUserId ?? "temp",
        name: currentUser?.name ?? "Usuario",
        initials: getCurrentUserInitials(),
        image: currentUser?.image
      },
      replies: []
    };

    // Non-blocking: Store comment content and clear form immediately
    const commentContent = newComment;
    setNewComment(""); // Clear immediately so user can type more
    
    // Process optimistic update and server request in transition
    startTransition(async () => {
      // Add optimistic comment inside transition
      addOptimisticComment({ type: 'ADD_COMMENT', comment: tempComment });
      try {
        const result = await createCommentAction({
          listingId,
          propertyId,
          content: commentContent,
        });

        if (!result.success) {
          toast.error(result.error ?? "Error al crear el comentario");
          // Revert optimistic update on error
          addOptimisticComment({ type: 'DELETE_COMMENT', commentId: tempComment.commentId.toString() });
        } else {
          // Refetch comments to get the real data with user info
          try {
            const { getCommentsByListingIdWithAuth } = await import("~/server/queries/comments");
            const freshComments = await getCommentsByListingIdWithAuth(listingId);
            setComments(freshComments);
          } catch {
            // If refetch fails, optimistic update remains
          }
          toast.success("Comentario creado exitosamente");
        }
      } catch (error) {
        console.error("Error creating comment:", error);
        toast.error("Error interno del servidor");
      }
    });
  };

  const handleAddReply = async (parentId: bigint) => {
    const content = replyContents[parentId.toString()] ?? "";
    if (!content.trim()) return;

    // Create optimistic reply with current user info
    const tempReply: CommentWithUser = {
      commentId: BigInt(Date.now()),
      listingId,
      propertyId,
      userId: currentUserId ?? "temp",
      content: content,
      parentId: parentId,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: currentUserId ?? "temp",
        name: currentUser?.name ?? "Usuario",
        initials: getCurrentUserInitials(),
        image: currentUser?.image
      },
      replies: []
    };

    // Non-blocking: Clear form and close reply UI immediately so user can continue
    setReplyContents(prev => ({ ...prev, [parentId.toString()]: "" }));
    setReplyingTo(null);
    
    // Process optimistic update and server request in transition
    startTransition(async () => {
      // Add optimistic reply inside transition
      addOptimisticComment({ 
        type: 'ADD_REPLY', 
        parentId: parentId.toString(),
        reply: tempReply 
      });
      try {
        const result = await createCommentAction({
          listingId,
          propertyId,
          content: content,
          parentId,
        });

        if (!result.success) {
          toast.error(result.error ?? "Error al crear la respuesta");
          // Revert optimistic update on error
          addOptimisticComment({ type: 'DELETE_REPLY', commentId: tempReply.commentId.toString() });
        } else {
          // Refetch comments to get the real data with user info
          try {
            const { getCommentsByListingIdWithAuth } = await import("~/server/queries/comments");
            const freshComments = await getCommentsByListingIdWithAuth(listingId);
            setComments(freshComments);
          } catch {
            // If refetch fails, optimistic update remains
          }
          toast.success("Respuesta creada exitosamente");
        }
      } catch (error) {
        console.error("Error creating reply:", error);
        toast.error("Error interno del servidor");
      }
    });
  };

  const handleEditComment = async (commentId: bigint) => {
    if (!editContent.trim()) return;

    // Store original content for potential reversion
    const originalComment = optimisticComments.find(c => c.commentId === commentId) ?? 
                           optimisticComments.find(c => c.replies.some(r => r.commentId === commentId))?.replies.find(r => r.commentId === commentId);
    const originalContent = originalComment?.content ?? "";
    
    // Store edit content and exit edit mode immediately for instant UX
    const newContent = editContent;
    setEditingComment(null);
    setEditContent("");

    startTransition(async () => {
      // Optimistically update comment content immediately
      addOptimisticComment({ 
        type: 'UPDATE_COMMENT', 
        commentId: commentId.toString(),
        content: newContent 
      });
      
      try {
        const result = await updateCommentAction({
          commentId,
          content: newContent,
        });

        if (!result.success) {
          toast.error(result.error ?? "Error al editar el comentario");
          // Revert optimistic update to original content
          addOptimisticComment({ 
            type: 'UPDATE_COMMENT', 
            commentId: commentId.toString(),
            content: originalContent 
          });
        } else {
          // Success - optimistic update was correct, just show success message
          toast.success("Comentario editado exitosamente");
        }
      } catch (error) {
        console.error("Error editing comment:", error);
        toast.error("Error interno del servidor");
        // Revert optimistic update to original content
        addOptimisticComment({ 
          type: 'UPDATE_COMMENT', 
          commentId: commentId.toString(),
          content: originalContent 
        });
      }
    });
  };

  const handleDeleteComment = async (commentId: bigint) => {
    startDeleteTransition(async () => {
      // Check if it's a parent comment with replies
      const parentComment = optimisticComments.find(comment => comment.commentId === commentId);
      const isReply = optimisticComments.some(comment => 
        comment.replies.some(reply => reply.commentId === commentId)
      );
      
      if (isReply) {
        // Simple reply delete
        addOptimisticComment({ type: 'DELETE_REPLY', commentId: commentId.toString() });
      } else if (parentComment && parentComment.replies.length > 0) {
        // Parent comment with replies - cascade delete
        console.log(`Optimistically deleting parent comment with ${parentComment.replies.length} replies`);
        addOptimisticComment({ type: 'DELETE_COMMENT', commentId: commentId.toString() });
      } else {
        // Parent comment without replies
        addOptimisticComment({ type: 'DELETE_COMMENT', commentId: commentId.toString() });
      }
      
      try {
        const result = await deleteCommentAction(commentId);

        if (!result.success) {
          toast.error(result.error ?? "Error al eliminar el comentario");
          // Revert optimistic delete by refetching comments
          try {
            const { getCommentsByListingIdWithAuth } = await import("~/server/queries/comments");
            const freshComments = await getCommentsByListingIdWithAuth(listingId);
            setComments(freshComments);
          } catch {
            // If refetch fails, do nothing - optimistic update remains
          }
        } else {
          // Refetch comments after successful delete to ensure consistency
          try {
            const { getCommentsByListingIdWithAuth } = await import("~/server/queries/comments");
            const freshComments = await getCommentsByListingIdWithAuth(listingId);
            setComments(freshComments);
          } catch {
            // If refetch fails, optimistic update remains which is still good
          }
          toast.success("Comentario eliminado exitosamente");
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        toast.error("Error interno del servidor");
      }
    });
  };

  const startEditingComment = (comment: CommentWithUser) => {
    setEditingComment(comment.commentId);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent("");
  };



  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser?.image ?? undefined} />
              <AvatarFallback>{getCurrentUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none border-gray-200"
              />
              <div className="flex justify-end mt-3">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Comentar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">Cargando comentarios...</p>
            </CardContent>
          </Card>
        ) : optimisticComments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No hay comentarios aún. ¡Sé el primero en comentar!</p>
            </CardContent>
          </Card>
        ) : (
          optimisticComments.map((comment) => (
            <Card key={comment.commentId.toString()}>
              <CardContent className="p-4">
                <CommentItem 
                  comment={comment} 
                  currentUserId={currentUserId}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContents={replyContents}
                  setReplyContents={setReplyContents}
                  editingComment={editingComment}
                  setEditingComment={setEditingComment}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  isPending={isPending}
                  isDeleting={isDeleting}
                  handleAddReply={handleAddReply}
                  handleEditComment={handleEditComment}
                  handleDeleteComment={handleDeleteComment}
                  startEditingComment={startEditingComment}
                  cancelEditing={cancelEditing}
                  setCommentToDelete={setCommentToDelete}
                  setDeleteConfirmOpen={setDeleteConfirmOpen}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Eliminar comentario"
        description={(() => {
          if (!commentToDelete) return "¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.";
          
          const comment = optimisticComments.find(c => c.commentId === commentToDelete);
          const replyCount = comment?.replies?.length ?? 0;
          
          if (replyCount > 0) {
            return `Este comentario tiene ${replyCount} respuesta${replyCount > 1 ? 's' : ''}. Al eliminarlo también se eliminarán todas las respuestas. ¿Estás seguro? Esta acción no se puede deshacer.`;
          }
          
          return "¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.";
        })()}
        onConfirm={() => {
          if (commentToDelete) {
            void handleDeleteComment(commentToDelete);
            setCommentToDelete(null);
          }
        }}
        onCancel={() => setCommentToDelete(null)}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="destructive"
      />
    </div>
  );
}
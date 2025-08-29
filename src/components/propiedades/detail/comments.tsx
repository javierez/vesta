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
  handleAddReply: (parentId: bigint) => Promise<void>;
  handleEditComment: (commentId: bigint) => Promise<void>;
  handleDeleteComment: (commentId: bigint) => Promise<void>;
  startEditingComment: (comment: CommentWithUser) => void;
  cancelEditing: () => void;
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
  handleAddReply,
  handleEditComment,
  handleDeleteComment,
  startEditingComment,
  cancelEditing
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
                    onClick={() => handleDeleteComment(comment.commentId)}
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
                    disabled={!editContent.trim() || isPending}
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
                  value={replyContents[comment.commentId.toString()] || ""}
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
                    disabled={!(replyContents[comment.commentId.toString()] || "").trim() || isPending}
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
                  handleAddReply={handleAddReply}
                  handleEditComment={handleEditComment}
                  handleDeleteComment={handleDeleteComment}
                  startEditingComment={startEditingComment}
                  cancelEditing={cancelEditing}
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
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<bigint | null>(null);
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [editingComment, setEditingComment] = useState<bigint | null>(null);
  const [editContent, setEditContent] = useState("");


  const handleAddComment = async () => {
    if (!newComment.trim() || isPending) return;

    const tempComment: CommentWithUser = {
      commentId: BigInt(Date.now()),
      listingId,
      propertyId,
      userId: currentUserId || "temp",
      content: newComment,
      parentId: null,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: currentUserId || "temp",
        name: currentUser?.name || "Enviando...",
        initials: getCurrentUserInitials(),
        image: currentUser?.image
      },
      replies: []
    };

    startTransition(async () => {
      addOptimisticComment({ type: 'ADD_COMMENT', comment: tempComment });
      setNewComment("");
      
      try {
        const result = await createCommentAction({
          listingId,
          propertyId,
          content: newComment,
        });

        if (!result.success) {
          toast.error(result.error ?? "Error al crear el comentario");
          // Revert optimistic update on error
          addOptimisticComment({ type: 'DELETE_COMMENT', commentId: tempComment.commentId.toString() });
        } else {
          toast.success("Comentario creado exitosamente");
        }
      } catch (error) {
        console.error("Error creating comment:", error);
        toast.error("Error interno del servidor");
      }
    });
  };

  const handleAddReply = async (parentId: bigint) => {
    const content = replyContents[parentId.toString()] || "";
    if (!content.trim() || isPending) return;

    // Create optimistic reply with current user info
    const tempReply: CommentWithUser = {
      commentId: BigInt(Date.now()),
      listingId,
      propertyId,
      userId: currentUserId || "temp",
      content: content,
      parentId: parentId,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: currentUserId || "temp",
        name: currentUser?.name || "Enviando...",
        initials: getCurrentUserInitials(),
        image: currentUser?.image
      },
      replies: []
    };

    startTransition(async () => {
      // Optimistically add reply immediately
      addOptimisticComment({ 
        type: 'ADD_REPLY', 
        parentId: parentId.toString(),
        reply: tempReply 
      });
      // Clear form and close reply UI immediately
      setReplyContents(prev => ({ ...prev, [parentId.toString()]: "" }));
      setReplyingTo(null);
      
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
          toast.success("Respuesta creada exitosamente");
        }
      } catch (error) {
        console.error("Error creating reply:", error);
        toast.error("Error interno del servidor");
      }
    });
  };

  const handleEditComment = async (commentId: bigint) => {
    if (!editContent.trim() || isPending) return;

    startTransition(async () => {
      // Optimistically update comment content immediately
      addOptimisticComment({ 
        type: 'UPDATE_COMMENT', 
        commentId: commentId.toString(),
        content: editContent 
      });
      // Exit edit mode immediately
      setEditingComment(null);
      setEditContent("");
      
      try {
        const result = await updateCommentAction({
          commentId,
          content: editContent,
        });

        if (!result.success) {
          toast.error(result.error ?? "Error al editar el comentario");
          // Revert optimistic update on error - we'd need to store original content
          // For now, just refresh the page or refetch comments
          window.location.reload();
        } else {
          toast.success("Comentario editado exitosamente");
        }
      } catch (error) {
        console.error("Error editing comment:", error);
        toast.error("Error interno del servidor");
      }
    });
  };

  const handleDeleteComment = async (commentId: bigint) => {
    if (!confirm("\u00bfEst\u00e1s seguro de que quieres eliminar este comentario?")) {
      return;
    }

    startTransition(async () => {
      // Optimistically remove comment immediately
      // Check if it's a reply first
      const isReply = optimisticComments.some(comment => 
        comment.replies.some(reply => reply.commentId === commentId)
      );
      
      if (isReply) {
        addOptimisticComment({ type: 'DELETE_REPLY', commentId: commentId.toString() });
      } else {
        addOptimisticComment({ type: 'DELETE_COMMENT', commentId: commentId.toString() });
      }
      
      try {
        const result = await deleteCommentAction(commentId);

        if (!result.success) {
          toast.error(result.error ?? "Error al eliminar el comentario");
        } else {
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
                  disabled={!newComment.trim() || isPending}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  {isPending ? "Enviando..." : "Comentar"}
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
                  handleAddReply={handleAddReply}
                  handleEditComment={handleEditComment}
                  handleDeleteComment={handleDeleteComment}
                  startEditingComment={startEditingComment}
                  cancelEditing={cancelEditing}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
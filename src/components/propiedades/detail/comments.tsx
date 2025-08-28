"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent } from "~/components/ui/card";
import { Heart, MessageCircle, MoreHorizontal, Reply } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  createdAt: Date;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  parentId?: string;
}

interface CommentsProps {
  propertyId: bigint;
  listingId: bigint;
  referenceNumber: string;
}

const mockComments: Comment[] = [
  {
    id: "1",
    content: "¿Ha habido algún problema con la instalación eléctrica? Vi que había cables sueltos en el sótano.",
    author: {
      id: "user1",
      name: "María García",
      initials: "MG"
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: 3,
    isLiked: false,
    replies: [
      {
        id: "1-1",
        content: "Sí, ya lo hemos reportado al electricista. Debería estar resuelto para la próxima semana.",
        author: {
          id: "user2", 
          name: "Carlos Ruiz",
          initials: "CR"
        },
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        likes: 1,
        isLiked: true,
        replies: [],
        parentId: "1"
      },
      {
        id: "1-2",
        content: "Perfecto, gracias por la actualización. ¿Tienen alguna estimación del costo?",
        author: {
          id: "user1",
          name: "María García", 
          initials: "MG"
        },
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        likes: 0,
        isLiked: false,
        replies: [],
        parentId: "1"
      }
    ]
  },
  {
    id: "2",
    content: "Las fotos de la cocina se ven geniales. ¿Es posible programar una visita para este fin de semana?",
    author: {
      id: "user3",
      name: "Ana López",
      initials: "AL"
    },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    likes: 5,
    isLiked: true,
    replies: [
      {
        id: "2-1",
        content: "¡Por supuesto! Te envío un mensaje privado con los horarios disponibles.",
        author: {
          id: "user2",
          name: "Carlos Ruiz",
          initials: "CR"
        },
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        likes: 2,
        isLiked: false,
        replies: [],
        parentId: "2"
      }
    ]
  }
];

export function Comments({ propertyId, listingId, referenceNumber }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const currentUser = {
    id: "currentUser",
    name: "Usuario Actual",
    initials: "UA"
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: currentUser,
      createdAt: new Date(),
      likes: 0,
      isLiked: false,
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  const handleAddReply = (parentId: string) => {
    if (!replyContent.trim()) return;

    const reply: Comment = {
      id: `${parentId}-${Date.now()}`,
      content: replyContent,
      author: currentUser,
      createdAt: new Date(),
      likes: 0,
      isLiked: false,
      replies: [],
      parentId
    };

    setComments(comments.map(comment => {
      if (comment.id === parentId) {
        return { ...comment, replies: [...comment.replies, reply] };
      }
      return comment;
    }));

    setReplyContent("");
    setReplyingTo(null);
  };

  const handleLike = (commentId: string, parentId?: string) => {
    if (parentId) {
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  isLiked: !reply.isLiked,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
                };
              }
              return reply;
            })
          };
        }
        return comment;
      }));
    } else {
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          };
        }
        return comment;
      }));
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>{comment.author.initials}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-2xl px-4 py-3">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm">{comment.author.name}</span>
              <span className="text-gray-500 text-xs">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: es })}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-900">{comment.content}</p>
          </div>
          
          <div className="flex items-center mt-2 space-x-4">
            <button
              onClick={() => handleLike(comment.id, comment.parentId)}
              className={`flex items-center space-x-1 text-xs hover:text-red-500 transition-colors ${
                comment.isLiked ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
              <span>{comment.likes}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors"
              >
                <Reply className="h-4 w-4" />
                <span>Responder</span>
              </button>
            )}
            
            <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          
          {replyingTo === comment.id && (
            <div className="mt-3 flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{currentUser.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder={`Responder a ${comment.author.name}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[60px] resize-none border-gray-200"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAddReply(comment.id)}
                    disabled={!replyContent.trim()}
                  >
                    Responder
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{currentUser.initials}</AvatarFallback>
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
        {comments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No hay comentarios aún. ¡Sé el primero en comentar!</p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}
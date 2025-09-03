/**
 * User comment type definitions for contact-based comments system
 * Uses user_comments table with hierarchical structure and user relationships
 */

export interface UserComment {
  commentId: bigint;
  contactId: bigint;
  userId: string;
  content: string;
  parentId?: bigint | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCommentWithUser extends UserComment {
  user: {
    id: string;
    name: string;
    firstName?: string | null;
    lastName?: string | null;
    image?: string | null;
    initials: string;
  };
  replies: UserCommentWithUser[];
}

export interface CreateUserCommentFormData {
  contactId: string | bigint;
  content: string;
  parentId?: string | bigint | null;
}

export interface UpdateUserCommentFormData {
  commentId: string | bigint;
  content: string;
}

export interface UserCommentActionResult {
  success: boolean;
  error?: string;
  data?: UserComment;
}

export interface UserCommentFilters {
  contactId?: bigint;
  userId?: string;
  parentId?: bigint | null;
  isDeleted?: boolean;
}

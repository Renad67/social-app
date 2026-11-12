import { Types } from "mongoose";

export interface CreateCommentDTO {
  content?: string;
  attachment?: string;
  mentions?: Types.ObjectId[];

  // userId >> token mendatory
  // postId >> params
  // parentId >> params
}

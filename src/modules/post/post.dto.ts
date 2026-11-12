/*<<UNSEEN lines 1-6: import lines never shown on screen; reconstructed from usage (z, Types, BadRequestException, SYS_REACTION)>>*/
import z from "zod";
import { Types } from "mongoose";
import { BadRequestException, SYS_REACTION } from "../../common";

// data transfer object
export interface CreatePostDTO {
  // userId will be extracted from the token >> req.user.id
  content?: string;
  attachments?: string[]; // [url, url, ...]
}

export const createPostSchema = z
  .object({
    content: z.string().optional(),
    attachments: z.array(z.string()).optional(),
  })
  .refine((data) => {
    const { content, attachments } = data;
    if (!content && (!attachments || attachments.length === 0)) {
      throw new BadRequestException("Content or attachments must be provided");
    }
    return true;
  });

export interface AddReactionDTO {
  postId: Types.ObjectId;
  reaction: SYS_REACTION; // 0: like, 1: love, 2: haha, 3: wow, 4: sad, 5: angry
}

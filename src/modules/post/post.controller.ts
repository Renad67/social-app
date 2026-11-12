import { NextFunction, Request, Response, Router } from "express";
import { Types } from "mongoose";
import { isValid } from "../../middleware";
import { createPostSchema } from "./post.dto";
import postService from "./post.service";
import { default as commentRouter } from "../comment/comment.controller";
const router = Router(); // sub app
// post
// :postId/comment
router.use("/:postId/comment", commentRouter);

// method = post >> create , url /post
router.post(
  "/",
  // todo apply auth middleware to get userId from token and pass it to service layer
  isValid(createPostSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const createdPost = await postService.create(
      req.body,
      new Types.ObjectId("69dd34daa8208628f1e19f75"),
    );

    return res.status(201).json({
      message: "post created successfully",
      success: true,
      data: { createdPost },
    });
  },
);

router.post(
  "/reaction",
  async (req: Request, res: Response, next: NextFunction) => {
    await postService.addReaction(
      req.body,
      new Types.ObjectId("69dd34daa8208628f1e19f75"),
    );
    // {message: "reaction added/removed successfully", success: true}
    return res.sendStatus(204); // no content
  },
);

export default router;

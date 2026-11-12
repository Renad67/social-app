import { NextFunction, Request, Response, Router } from "express";
import { Types } from "mongoose";
import { addReaction } from "../../common";
import { commentRepo } from "../../DB/models/comment/comment.repository";
import commentService from "./comment.service";

// express 4.x.x >> /:parentId?
// express 5.x.x >> {/:parentId}
const router = Router({ mergeParams: true });
// /comment/add-reaction
// /post/postId/comment/add-reaction
router.post(
  "/add-reaction",
  async (req: Request, res: Response, next: NextFunction) => {
    await addReaction(
      req.body,
      new Types.ObjectId("69dd34daa8208628f1e19f75"),
      commentRepo,
    );

    // send response
    res.sendStatus(204); // done >> no content
  },
);
// /comment/:commentId >> reply
// /post/:postId/comment/:commentId >> reply
// /post/:postId/comment >> top level comment

// merge params

router.post(
  "{/:parentId}",
  // todo:auth,
  // todo:fileupload
  // todo:validation
  async (req: Request, res: Response, next: NextFunction) => {
    const createdComment = await commentService.create(
      req.body,
      req.params,
      new Types.ObjectId("69dd34daa8208628f1e19f75"),
    );

    // send response
    res.status(201).json({ data: createdComment }); // done >> no content
  },
);

router.get(
  "/:postId{/:parentId}",
  async (req: Request, res: Response, next: NextFunction) => {
    const comments = await commentService.getAll(req.params);

    // send response
    res.status(200).json({ success: true, data: comments }); // done >> no content
  },
);

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    await commentService.delete(
      new Types.ObjectId(req.params.id as string),
      new Types.ObjectId("69dd34daa8208628f1e19f75"),
    );
    return res.sendStatus(204);
  },
);
export default router;

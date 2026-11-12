import { Types } from "mongoose";
import { CreateCommentDTO } from "./comment.dto";
import { PostRepository } from "../../DB/models/post/post.repository";
import { IPost, NotFoundException, UnAuthorizedException } from "../../common";
import { CommentRepository } from "../../DB/models/comment/comment.repository";

class CommentService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
  ) {}

  // data >> body >> dto
  async create(
    createCommentDTO: CreateCommentDTO,
    params: any,
    userId: Types.ObjectId,
  ) {
    // postId check existence
    if (params.postId) {
      /*<<UNSEEN lines 21-24: folded after the cut/paste in v27; reconstructed from the cut code>>*/
      const postExist = await this.postRepository.getOne({
        _id: params.postId,
      }); // null
      if (!postExist) throw new NotFoundException("post not found");
    }
    // if parentId >> reply check parentId
    let parentCommentExist = undefined;
    if (params.parentId) {
      parentCommentExist = await this.commentRepository.getOne({
        _id: params.parentId,
      });
      if (!parentCommentExist) throw new NotFoundException("comment not found");
    }
    // if yes create comment
    return await this.commentRepository.create({
      ...createCommentDTO,
      ...params, // {postId:1,parentId:2} , {parentId:2}
      userId,
      postId: params.postId || parentCommentExist?.postId,
    });
  }

  // method >> get >> not have body
  async getAll(params: any) {
    // params >> { postId , parentId }
    const comments = await this.commentRepository.getAll({
      postId: params.postId,
      parentId: params.parentId,
    });
    if (comments.length == 0) throw new NotFoundException("no comments");
    return comments;
  }

  // delete comment
  async delete(id: Types.ObjectId, userId: Types.ObjectId) {
    // check comment existence
    const commentExist = await this.commentRepository.getOne(
      { _id: id },
      {},
      { populate: [{ path: "postId" }] },
    ); // {} | null
    if (!commentExist) throw new NotFoundException("comment not found");
    // {_id,content,attachment,userId:1,parentId:1,postId:[{userid:1}]}
    // commentAuthor comment.userId
    let commentAuthor = commentExist.userId.toString();
    let postAuthor = (commentExist.postId as IPost[])[0]?.userId.toString();
    if (![postAuthor, commentAuthor].includes(userId.toString())) {
      throw new UnAuthorizedException(
        "you are not allowed to delete this comment",
      );
    }
    // delete comment
    await this.commentRepository.deleteOne({ _id: id });
    // mongoose middleware
    // document
    // query

  }
}

export default new CommentService(
  new PostRepository(),
  new CommentRepository(),
);

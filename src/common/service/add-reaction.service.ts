import { Types } from "mongoose";
import { UserReactionRepository } from "../../DB/models/user-reaction/user-reaction.repository";
import { AddReactionDTO } from "../dto";
import { BadRequestException, NotFoundException } from "../utils";
import { ON_MODEL } from "../enums";
import { PostRepository } from "../../DB/models/post/post.repository";
import { CommentRepository } from "../../DB/models/comment/comment.repository";

function toModel(collectionName: string) {
  switch (collectionName) {
    case "posts":
      return ON_MODEL.Post;
    case "comments":
      return ON_MODEL.Comment;

    default:
      throw new BadRequestException("invalid collection");
  }
}

export const addReaction = async (
  addReactionDTO: AddReactionDTO,
  userId: Types.ObjectId,
  repo: PostRepository | CommentRepository, // comment or post
) => {
  // check post existence
  const docExist = await repo.getOne({
    _id: addReactionDTO.id,
  }); // doc | null

  if (!docExist) {
    // Post - Comment - Story - Reel
    throw new NotFoundException(`${repo.model.modelName} not found`);
  }
  // model name
  const collectionName = docExist.collection.name; // posts - comments
  const userReactionRepository = new UserReactionRepository();
  // check user reactions
  const userReaction = await userReactionRepository.getOne({
    onModel: toModel(collectionName), // Post - Comment
    refId: addReactionDTO.id,
    userId,
  });

  // if no reaction >> create new reaction
  if (!userReaction) {
    await userReactionRepository.create({
      onModel: toModel(collectionName),
      refId: addReactionDTO.id,
      userId,
      reaction: addReactionDTO.reaction,
    });
    const doc = await repo.updateOne(
      { _id: addReactionDTO.id },
      { $inc: { reactionsCount: 1 } },
    );
    console.log({ doc });

    return;
  }

  // if same reaction >> remove reaction
  if (userReaction.reaction == addReactionDTO.reaction) {
    console.log({ userReaction });

    await userReactionRepository.deleteOne({
      _id: userReaction._id,
    });

    await repo.updateOne(
      { _id: addReactionDTO.id },
      { $inc: { reactionsCount: -1 } },
    );
    return;
  }

  // if different reaction >> update reaction
  await userReactionRepository.updateOne(
    { _id: userReaction._id },
    { reaction: addReactionDTO.reaction },
  );
  return;
};

import {Types} from "mongoose";
import {requestRepo, RequestRepository} from "../../DB/models/request/request.repository";
import {BadRequestException, ConflictException, NotFoundException, UnAuthorizedException} from "../../common";
import {userFriendRepo, UserFriendRepository} from "../../DB/models/user-friend/user-friend.repository";

class RequestService {
    constructor(private readonly requestRepository: RequestRepository,
                private readonly userFriendRepository: UserFriendRepository) {
    }

    /*
    * @params senderId >> sender [from token]
    * @params receiverId >> receiver [from req.params]
    * */
    async sendRequest(senderId: Types.ObjectId, receiverId: Types.ObjectId) {
        if (senderId.toString() == receiverId.toString()) throw new BadRequestException('not allowed to send request to yourself');
        // todo >> 1. check block users
        const userFriendExist = await this.userFriendRepository.getOne({
            $or: [
                {user: senderId, friend: receiverId},
                {user: receiverId, friend: senderId}
            ]
        })
        if (userFriendExist) throw new BadRequestException('you are already friends')
        // 3. check have request [sender send request or receiver]
        const requestExist = await this.requestRepository.getOne({
            $or: [
                {sender: senderId, receiver: receiverId},
                {sender: receiverId, receiver: senderId}
            ]
        })
        if (requestExist) throw new ConflictException('Request already exists')
        // 4. if no, create request
        await this.requestRepository.create({
            sender: senderId,
            receiver: receiverId
        })
        // 5. todo >> send notification to receiver
    }

    /*
    * @params userId >> user [from token]
    * @params id   >> requestId
    * */
    async acceptRequest(userId: Types.ObjectId, id: Types.ObjectId) {
        // 1. check request existence
        const requestExist = await this.requestRepository.getOne({_id: id});
        if (!requestExist) throw new NotFoundException('Request not found');
        // 2. if yes, check receiver accept request
        if (!requestExist.receiver.equals(userId)) throw new UnAuthorizedException('yor are not allowed to accept request');
        // 3. delete from request's table
        await this.requestRepository.deleteOne({_id: id});
        // 4. create user-friend table
        await this.userFriendRepository.create({
            user: userId,
            friend: requestExist.sender
        })
    }

    /*
    @params userId >> user login[token]
    @params id >> request id
     */
    async declineRequest(userId: Types.ObjectId, id: Types.ObjectId) {
        // 1. check request existence
        const requestExist = await this.requestRepository.getOne({_id: id})
        if (!requestExist) throw new NotFoundException('Request not found');
        // 2. if yes , check sender or receiver === userId
        // ![requestExist.sender.toString(), requestExist.receiver.toString()].includes(userId.toString())
        if (!userId.equals(requestExist.sender) && !userId.equals(requestExist.receiver))
            throw new UnAuthorizedException('yor are not allowed to decline or cancel request');
        // 3. delete from request's table
        await this.requestRepository.deleteOne({_id: id})
    }

    async declineRequest2(userId: Types.ObjectId, id: Types.ObjectId) {
        // 1 query to DB >> check existence and sender , receiver
        const {deletedCount} = await this.requestRepository.deleteOne({
            _id: id,
            $or: [{sender: userId}, {receiver: userId}]
        });// 0 >> 1
        // general error message >> throw err [request not found or you are not allowed to decline this request]
        if (deletedCount == 0)
            throw new BadRequestException('request not found or you are not allowed to decline this request')
    }

    /*
    @params userId >> user loggedIn [token]
    @params friendId
     */
    async removeFriend(userId: Types.ObjectId, friendId: Types.ObjectId) {
        if (userId.equals(friendId)) throw new BadRequestException('you are not allowed to remove yourself')
        // 1. delete from user friend table
        const {deletedCount} = await this.userFriendRepository.deleteOne({
            $or: [
                {user: userId, friend: friendId},
                {user: friendId, friend: userId}
            ]
        });
        if (deletedCount == 0)
            throw new NotFoundException("you are not friends")
    }
}

// todo >> apply DI
export default new RequestService(requestRepo, userFriendRepo)

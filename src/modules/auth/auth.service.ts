// nestJS >> dependency injection
// single tone

import {
  BadRequestException,
  ConflictException,
  encrypt,
  generateOTP,
  hash,
  NotFoundException,
  sendMail,
} from "../../common";

import { UserRepository } from "../../DB/models/user/user.repository";
import {
  deleteFromCache,
  getFromCache,
  setIntoCache,
} from "../../DB/redis.service";
import {
  RestPasswordDTO,
  LoginDTO,
  SendOtpDTO,
  SignupDTO,
  VerifyAccountDTO,
} from "./auth.dto";

class AuthService {
  private userRepository: UserRepository;
  constructor() {
    this.userRepository = new UserRepository();
  }

  async signup(signupDTO: SignupDTO) {
    const { email } = signupDTO;
    // check user existence
    const userExist = await this.userRepository.getOne({ email });
    if (userExist) throw new ConflictException("user already exists");
    // hash password
    signupDTO.password = await hash(signupDTO.password);
    // encryption phone number
    if (signupDTO.phoneNumber)
      signupDTO.phoneNumber = encrypt(signupDTO.phoneNumber);
    // send otp
    const otp = generateOTP();
    // send email
    await sendMail({
      to: signupDTO.email,
      subject: "confirm email",
      html: `<p>your otp to verify account is ${otp}</p>`,
    });
    // save otp into cache ttl
    await setIntoCache(`${signupDTO.email}:otp`, otp, 3 * 60);
    // create user into redis
    await setIntoCache(
      signupDTO.email,
      JSON.stringify(signupDTO),
      3 * 24 * 60 * 60,
    );
  }
  async verifyAccount(verifyAccountDTO: VerifyAccountDTO) {
    // get user data from cache >> null >> fail
    const userData = await getFromCache(verifyAccountDTO.email);
    if (!userData) throw new NotFoundException("user not found");
    // verify otp
    const otp = await getFromCache(`${verifyAccountDTO.email}:otp`);
    if (!otp) throw new BadRequestException("expire otp");
    if (otp != verifyAccountDTO.otp)
      throw new BadRequestException("invalid otp");
    // convert to real user
    await this.userRepository.create(JSON.parse(userData));
    // delete otp
    await deleteFromCache(`${verifyAccountDTO.email}:otp`);
    await deleteFromCache(`${verifyAccountDTO.email}`);
  }
  // forget password
  async sendOTP(sendOtpDTO: SendOtpDTO) {
    // check email existence into DB
    const userExistIntoDB = await this.userRepository.getOne({
      email: sendOtpDTO.email,
    });

    // check email existence into cache
    const userExistIntoCache = await getFromCache(sendOtpDTO.email);
    if (!userExistIntoCache && !userExistIntoDB) {
      throw new NotFoundException("user not found, please signup");
    }
    // // check already has a valid OTP
    // const otpExist = await getFromCache(`${sendOtpDTO.email}:otp`);
    // if (otpExist) {
    //   throw new BadRequestException("already have a valid otp");
    // }
    // generate new otp
    const otp = generateOTP();
    sendMail({
      to: sendOtpDTO.email,
      subject: "re-send otp",
      html: `<p>your otp is ${otp}</p>`,
    });
    await setIntoCache(`${sendOtpDTO.email}:otp`, otp, 3 * 60);
  }
  async resetPassword(resetPasswordDTO: RestPasswordDTO) {
    // check email valid
    const userExist = await this.userRepository.getOne({
      email: resetPasswordDTO.email,
    });
    if (!userExist) {
      throw new NotFoundException("user not found");
    }
    // check otp valid
    const otp = await getFromCache(`${resetPasswordDTO.email}:otp`);
    if (otp != resetPasswordDTO.otp) {
      throw new BadRequestException("invalid otp");
    }
    // hash password
    resetPasswordDTO.newPassword = await hash(resetPasswordDTO.newPassword);
    // update password
    await this.userRepository.updateOne(
      { email: resetPasswordDTO.email },
      { password: resetPasswordDTO.newPassword },
    );
  }
  login(loginDTO: LoginDTO) {}
}

export default new AuthService();

// authentication
// >> signup >> verifyAccount >> login >> sent OTP >> forgetPassword
//

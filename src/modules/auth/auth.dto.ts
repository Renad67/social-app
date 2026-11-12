// DTO >> data to object

import z from "zod";
import { signupSchema } from "./auth.validation";

// interfaces , class , types >> noun >> verb
// export interface SignupDTO {
//   email: string;
//   password: string;
//   userName: string;
//   phoneNumber?: string;
//   gender: SYS_GENDER;
// }
export type SignupDTO = z.infer<typeof signupSchema>;
export interface LoginDTO {
  email: string;
  password: string;
}

export interface VerifyAccountDTO {
  otp: string;
  email: string;
}

export interface SendOtpDTO {
  email: string;
}
export interface RestPasswordDTO {
  otp: string;
  email: string;
  newPassword: string;
}

export interface ResetPasswordDTO {
  password: string;
  otp: string;
  email: string;
}

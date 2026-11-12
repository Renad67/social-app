import z from "zod";
import { generalFields } from "../../common";
export const signupSchema = z
  .object({
    email: generalFields.email,
    gender: generalFields.gender,
    password: generalFields.password,
    userName: generalFields.userName,
    phoneNumber: generalFields.phoneNumber,
  })


export const loginSchema = {};
export const forgetPasswordSchema = {};

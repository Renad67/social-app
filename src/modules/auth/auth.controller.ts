import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import authService from "./auth.service";
import { isValid } from "../../middleware";
import { signupSchema } from "./auth.validation";
// @types/express
const router = Router();
// signup
// auth/signup
router.post(
  "/signup",
  isValid(signupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    // call service
    await authService.signup(req.body);
    // send response
    return res.status(201).json({
      message: "user created successfully",
      success: true,
    });
  },
);

router.post(
  "/verify-account",
  async (req: Request, res: Response, next: NextFunction) => {
    await authService.verifyAccount(req.body);
    return res
      .status(200)
      .json({ message: "user verified successfully", success: true });
  },
);

router.post(
  "/send-otp",
  async (req: Request, res: Response, next: NextFunction) => {
    await authService.sendOTP(req.body);
    return res
      .status(200)
      .json({ message: "resend otp successfully", success: true });
  },
);

router.patch(
  "/reset-password",
  async (req: Request, res: Response, next: NextFunction) => {
    await authService.resetPassword(req.body);
    return res
      .status(200)
      .json({ message: "reset password successfully", success: true });
  },
);

// change password
export default router;

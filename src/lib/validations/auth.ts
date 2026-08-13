import { z } from "zod";

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(72, { message: "Name must be under 72 characters" })
    .trim(),
  email: z
    .string()
    .email({ message: "Enter a valid email address" })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, { message: "At least 8 characters" })
    .regex(/[a-zA-Z]/, { message: "At least one letter" })
    .regex(/[0-9]/, { message: "At least one number" })
    .regex(/[^a-zA-Z0-9]/, { message: "At least one special character" }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Enter a valid email address" })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
});

export const otpSchema = z.object({
  email: z.string().email(),
  token: z
    .string()
    .length(8, { message: "Enter the 8-digit code" })
    .regex(/^\d+$/, { message: "Code must be numbers only" }),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpInput = z.infer<typeof otpSchema>;

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signupSchema, loginSchema, otpSchema } from "@/lib/validations/auth";

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = signupSchema.safeParse(raw);
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: { full_name: result.data.fullName },
    },
  });

  if (error) {
    if (error.message.includes("already registered") || error.status === 422) {
      return { error: "An account with this email already exists. Please sign in." };
    }
    return { error: error.message };
  }

  // If user exists but is identities empty (Supabase security feature for duplicate emails)
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "An account with this email already exists. Please sign in." };
  }

  redirect(`/verify?email=${encodeURIComponent(result.data.email)}`);
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  let error;
  try {
    ({ error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    }));
  } catch {
    return { error: "Unable to reach the login service. Check your connection and try again." };
  }

  if (error) {
    // If the email is registered but not verified yet, send them to the verify page
    if (error.message.toLowerCase().includes("email not confirmed")) {
      redirect(`/verify?email=${encodeURIComponent(result.data.email)}`);
    }
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function verifyOtp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    email: formData.get("email") as string,
    token: formData.get("token") as string,
  };

  const result = otpSchema.safeParse(raw);
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: result.data.email,
    token: result.data.token,
    type: "email",
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

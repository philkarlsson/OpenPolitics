import type { NextFunction, Request, Response } from "express";
import type { User } from "@supabase/supabase-js";
import { createSupabaseClient } from "../supabase.js";
import { HttpError } from "./errors.js";

declare module "express-serve-static-core" {
  interface Request {
    accessToken?: string;
    user?: User;
  }
}

export async function requireAuth(request: Request, _response: Response, next: NextFunction) {
  const header = request.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    next(new HttpError(401, "UNAUTHENTICATED", "Bearer token is required"));
    return;
  }

  const supabase = createSupabaseClient(token);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    next(new HttpError(401, "UNAUTHENTICATED", "Invalid or expired session"));
    return;
  }

  request.accessToken = token;
  request.user = data.user;
  next();
}

import { requireAuth } from "@clerk/express";

/**
 * Clerk Middleware
 * - Agar user authenticated hai toh req.userId set karega
 * - Nahi toh 401 return karega
 */
export const clerkAuth = (req, res, next) => {
  requireAuth()(req, res, () => {
    req.userId = req.auth.userId; // Clerk ka userId
    next();
  });
};

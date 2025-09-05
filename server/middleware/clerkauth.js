import { requireAuth } from "@clerk/express";


 
export const clerkAuth = (req, res, next) => {
  requireAuth()(req, res, () => {
    req.userId = req.auth.userId; 
    next();
  });
};

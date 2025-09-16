export const protect = async (req, res, next) => {
    console.log("hello")
  try {
    const { userId } = await req.auth(); // Clerk v5
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    req.userId = userId; // attach userId for controllers
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

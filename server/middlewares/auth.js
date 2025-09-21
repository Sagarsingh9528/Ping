export const protect = async (req, res, next) => {
    console.log("hello")
  try {
    const { userId } = await req.auth(); 
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    req.userId = userId;
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

module.exports = (roles) => {
  return (req, res, next) => {
    // Check if req.headers exists
    if (!req.headers || !req.headers.authorization) {
      return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
      // Extract user role from req.user (it should be set by authMiddleware)
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access Denied: Insufficient Permissions" });
      }
      next(); // Proceed to the next middleware or route
    } catch (error) {
      res.status(400).json({ message: "Invalid Token" });
    }
  };
};

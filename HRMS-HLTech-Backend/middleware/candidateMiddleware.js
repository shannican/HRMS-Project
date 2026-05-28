const jwt = require("jsonwebtoken");
const Candidate = require("../models/Candidatess");

const protectCandidate = async (req, res, next) => {
  console.log("Candidate middleware: Checking authentication for request");

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token.slice(0, 10) + "...");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded:", {
        userId: decoded.userId,
        role: decoded.role,
      });

      const candidate = await Candidate.findById(decoded.userId);
      if (!candidate) {
        console.log("No candidate found for ID:", decoded.userId);
        return res.status(401).json({ message: "Not authorized: Candidate not found" });
      }

      if (candidate.role !== "candidate") {
        console.log("Invalid role for candidate middleware:", candidate.role);
        return res.status(403).json({ message: "Not authorized: Not a candidate" });
      }

      req.user = candidate;
      console.log("Candidate authenticated:", {
        email: candidate.email,
        role: candidate.role,
      });

      next();
    } catch (error) {
      console.error("Error in candidate middleware:", error.message);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Not authorized: Token expired" });
      }
      return res.status(401).json({ message: "Not authorized: Invalid token" });
    }
  } else {
    console.log("No token provided in request");
    return res.status(401).json({ message: "Not authorized: No token provided" });
  }
};

console.log("candidateMiddleware exports:", { protectCandidate });

module.exports = { protectCandidate };
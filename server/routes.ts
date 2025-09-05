import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyAdvisorSchema, checkAppSchema, insertReviewSchema, loginSchema, insertUserSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        user: { id: user.id, email: user.email, name: user.name }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(loginData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        user: { id: user.id, email: user.email, name: user.name }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Advisor verification
  app.post("/api/verify-advisor", authenticateToken, async (req, res) => {
    try {
      const data = verifyAdvisorSchema.parse(req.body);
      
      let advisor = null;
      
      // First try to find by registration number if provided
      if (data.regNumber) {
        advisor = await storage.getAdvisorByRegNumber(data.regNumber);
      }
      
      // If not found by reg number, try by name
      if (!advisor) {
        advisor = await storage.getAdvisorByName(data.name);
      }

      if (!advisor) {
        return res.json({
          found: false,
          message: "Advisor not found in SEBI database"
        });
      }

      // Get reviews for this advisor
      const reviews = await storage.getReviewsByAdvisor(advisor.id);
      
      res.json({
        found: true,
        advisor,
        reviews: reviews.length,
        avgRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // App checker
  app.post("/api/check-app", authenticateToken, async (req, res) => {
    try {
      const data = checkAppSchema.parse(req.body);
      
      let app = await storage.getAppByName(data.appName);
      
      if (!app) {
        // Create a new suspicious app entry
        app = await storage.createApp({
          appName: data.appName,
          url: data.url,
          developer: "Unknown",
          isLegit: false,
          riskFactors: [
            "App not found in verified database",
            "Unknown developer",
            "No regulatory registration found"
          ],
          recommendation: "⚠️ This app is not in our verified database. Exercise extreme caution and verify legitimacy before use."
        });
      }

      res.json({
        app,
        status: app.isLegit ? "legitimate" : "suspicious",
        riskFactors: app.riskFactors || [],
        recommendation: app.recommendation
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Reviews
  app.post("/api/add-review", authenticateToken, async (req: any, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.userId
      });
      
      const review = await storage.createReview(reviewData);
      res.json({ review, message: "Review added successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/reviews/:advisorId", authenticateToken, async (req, res) => {
    try {
      const { advisorId } = req.params;
      const reviews = await storage.getReviewsByAdvisor(advisorId);
      res.json({ reviews });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/recent-reviews", authenticateToken, async (req, res) => {
    try {
      const reviews = await storage.getRecentReviews(10);
      res.json({ reviews });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Dashboard data
  app.get("/api/recent-advisors", authenticateToken, async (req, res) => {
    try {
      const advisors = await storage.getRecentAdvisors(3);
      res.json({ advisors });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch advisors" });
    }
  });

  app.get("/api/top-rated-advisors", authenticateToken, async (req, res) => {
    try {
      const advisors = await storage.getTopRatedAdvisors(3);
      res.json({ advisors });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top rated advisors" });
    }
  });

  app.get("/api/legitimate-apps", authenticateToken, async (req, res) => {
    try {
      const apps = await storage.getLegitimateApps();
      res.json({ apps });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch legitimate apps" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

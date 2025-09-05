import { type User, type InsertUser, type Advisor, type InsertAdvisor, type App, type InsertApp, type Review, type InsertReview } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Advisor methods
  getAdvisor(id: string): Promise<Advisor | undefined>;
  getAdvisorByName(name: string): Promise<Advisor | undefined>;
  getAdvisorByRegNumber(regNumber: string): Promise<Advisor | undefined>;
  createAdvisor(advisor: InsertAdvisor): Promise<Advisor>;
  getRecentAdvisors(limit: number): Promise<Advisor[]>;
  getTopRatedAdvisors(limit: number): Promise<(Advisor & { avgRating: number; reviewCount: number })[]>;
  
  // App methods
  getApp(id: string): Promise<App | undefined>;
  getAppByName(appName: string): Promise<App | undefined>;
  createApp(app: InsertApp): Promise<App>;
  getLegitimateApps(): Promise<App[]>;
  
  // Review methods
  getReview(id: string): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByAdvisor(advisorId: string): Promise<Review[]>;
  getRecentReviews(limit: number): Promise<(Review & { advisorName: string; userName: string })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private advisors: Map<string, Advisor>;
  private apps: Map<string, App>;
  private reviews: Map<string, Review>;

  constructor() {
    this.users = new Map();
    this.advisors = new Map();
    this.apps = new Map();
    this.reviews = new Map();
    
    this.seedData();
  }

  private seedData() {
    // Seed advisors
    const advisors = [
      {
        id: randomUUID(),
        name: "Rajesh Kumar",
        regNumber: "INH200001234",
        isRegistered: true,
        complaintsCount: 1,
        trustScore: 85,
        yearsExperience: 6,
        specialization: "Investment Advisory"
      },
      {
        id: randomUUID(),
        name: "Dr. Priya Sharma",
        regNumber: "INH200005678",
        isRegistered: true,
        complaintsCount: 0,
        trustScore: 94,
        yearsExperience: 8,
        specialization: "Portfolio Management"
      },
      {
        id: randomUUID(),
        name: "Amit Sharma",
        regNumber: "INH200009012",
        isRegistered: true,
        complaintsCount: 0,
        trustScore: 92,
        yearsExperience: 5,
        specialization: "Mutual Fund Advisory"
      }
    ];

    advisors.forEach(advisor => this.advisors.set(advisor.id, advisor));

    // Seed apps
    const apps = [
      {
        id: randomUUID(),
        appName: "QuickTrade Pro",
        url: "quicktradepro.net",
        developer: "Unknown",
        isLegit: false,
        riskFactors: [
          "Domain registered less than 6 months ago",
          "Logo matches legitimate broker \"TradeSafe\"",
          "No SEBI registration found"
        ],
        recommendation: "⚠️ Do not use this app for trading or provide personal information. Consider using verified brokers from our legitimate brokers list."
      },
      {
        id: randomUUID(),
        appName: "Zerodha",
        url: "zerodha.com",
        developer: "Zerodha Broking Ltd",
        isLegit: true,
        riskFactors: [],
        recommendation: "✅ This is a legitimate and SEBI registered broker. Safe to use for trading."
      },
      {
        id: randomUUID(),
        appName: "Upstox",
        url: "upstox.com",
        developer: "RKSV Securities India Pvt Ltd",
        isLegit: true,
        riskFactors: [],
        recommendation: "✅ This is a legitimate and SEBI registered broker. Safe to use for trading."
      }
    ];

    apps.forEach(app => this.apps.set(app.id, app));

    // Seed reviews
    const reviews = [
      {
        id: randomUUID(),
        advisorId: advisors[0].id,
        userId: randomUUID(),
        rating: 4,
        comment: "Professional and knowledgeable. Helped me understand my investment options clearly.",
        timestamp: new Date(),
        isVerified: true
      },
      {
        id: randomUUID(),
        advisorId: advisors[0].id,
        userId: randomUUID(),
        rating: 5,
        comment: "Excellent advice on mutual funds. Very professional and transparent about fees. Highly recommend for long-term investment planning.",
        timestamp: new Date(),
        isVerified: true
      }
    ];

    reviews.forEach(review => this.reviews.set(review.id, review));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAdvisor(id: string): Promise<Advisor | undefined> {
    return this.advisors.get(id);
  }

  async getAdvisorByName(name: string): Promise<Advisor | undefined> {
    return Array.from(this.advisors.values()).find(
      advisor => advisor.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  async getAdvisorByRegNumber(regNumber: string): Promise<Advisor | undefined> {
    return Array.from(this.advisors.values()).find(
      advisor => advisor.regNumber === regNumber
    );
  }

  async createAdvisor(insertAdvisor: InsertAdvisor): Promise<Advisor> {
    const id = randomUUID();
    const advisor: Advisor = { ...insertAdvisor, id };
    this.advisors.set(id, advisor);
    return advisor;
  }

  async getRecentAdvisors(limit: number): Promise<Advisor[]> {
    return Array.from(this.advisors.values()).slice(0, limit);
  }

  async getTopRatedAdvisors(limit: number): Promise<(Advisor & { avgRating: number; reviewCount: number })[]> {
    const advisorsWithRatings = Array.from(this.advisors.values()).map(advisor => {
      const advisorReviews = Array.from(this.reviews.values()).filter(r => r.advisorId === advisor.id);
      const avgRating = advisorReviews.length > 0 
        ? advisorReviews.reduce((sum, r) => sum + r.rating, 0) / advisorReviews.length 
        : 0;
      return {
        ...advisor,
        avgRating,
        reviewCount: advisorReviews.length
      };
    }).filter(a => a.reviewCount > 0)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, limit);

    return advisorsWithRatings;
  }

  async getApp(id: string): Promise<App | undefined> {
    return this.apps.get(id);
  }

  async getAppByName(appName: string): Promise<App | undefined> {
    return Array.from(this.apps.values()).find(
      app => app.appName.toLowerCase().includes(appName.toLowerCase())
    );
  }

  async createApp(insertApp: InsertApp): Promise<App> {
    const id = randomUUID();
    const app: App = { ...insertApp, id };
    this.apps.set(id, app);
    return app;
  }

  async getLegitimateApps(): Promise<App[]> {
    return Array.from(this.apps.values()).filter(app => app.isLegit);
  }

  async getReview(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = { 
      ...insertReview, 
      id,
      timestamp: new Date()
    };
    this.reviews.set(id, review);
    return review;
  }

  async getReviewsByAdvisor(advisorId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.advisorId === advisorId);
  }

  async getRecentReviews(limit: number): Promise<(Review & { advisorName: string; userName: string })[]> {
    const reviews = Array.from(this.reviews.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return reviews.map(review => {
      const advisor = this.advisors.get(review.advisorId);
      const user = this.users.get(review.userId);
      return {
        ...review,
        advisorName: advisor?.name || "Unknown Advisor",
        userName: user?.name || "Anonymous"
      };
    });
  }
}

export const storage = new MemStorage();

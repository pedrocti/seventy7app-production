import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      role: string;
      username?: string; 
      referral_code?: string;
      referred_by?: number;
    };
  }
}

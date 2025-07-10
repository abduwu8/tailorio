import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

export const isAuthenticated = (req: Request): boolean => {
  return !!req.user;
}; 
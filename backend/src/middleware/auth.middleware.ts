import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token with Supabase Auth
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        res.status(401);
        throw new Error('Not authorized, token failed');
      }

      // Attach user to request
      // We also check our 'users' table for the role
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      req.user = { ...user, ...profile };
      
      if (req.user.is_suspended) {
        res.status(403);
        throw new Error('User account is suspended');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Role ${req.user?.role} is not authorized to access this route`));
    }
    next();
  };
};

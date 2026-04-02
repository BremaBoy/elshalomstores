import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      res.status(400);
      throw new Error('Please provide email, password, and name');
    }

    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      res.status(400);
      throw new Error(authError.message);
    }

    if (!authData.user) {
      res.status(500);
      throw new Error('User creation failed');
    }

    // 2. Create user profile in 'users' table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          name,
          email,
          phone,
          role: 'customer', // Default role
        },
      ])
      .select()
      .single();

    if (profileError) {
      // If profile creation fails, we might want to delete the auth user?
      // For now, just log and throw
      logger.error(`Profile creation failed for ${authData.user.id}: ${profileError.message}`);
      res.status(500);
      throw new Error('Profile creation failed');
    }

    res.status(201).json({
      success: true,
      user: profile,
      session: authData.session,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile?.is_suspended) {
      res.status(403);
      throw new Error('Account is suspended');
    }

    res.json({
      success: true,
      user: { ...data.user, ...profile },
      session: data.session,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: any, res: Response, next: NextFunction) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

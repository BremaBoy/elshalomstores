import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;

    const settingsObj = data.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    res.json({
      success: true,
      data: settingsObj,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = req.body; // { key: value, ... }
    const entries = Object.entries(settings);

    for (const [key, value] of entries) {
      const { error } = await supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' });
      if (error) throw error;
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadImage = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image');
    }

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'products')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'products')
      .getPublicUrl(filePath);

    res.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMiddleware = upload.single('image');

import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { logger } from './config/logger';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 Elshalomstores API running on port ${PORT} [${process.env.NODE_ENV}]`);
});

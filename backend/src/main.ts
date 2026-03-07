import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = __dirname.includes('dist')
  ? path.resolve(__dirname, '..', '..', '.env')
  : path.resolve(__dirname, '..', '.env');

console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Environment check:');
  console.log('  GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set ✓' : 'Not set ✗');
  console.log('  SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set ✓' : 'Not set ✗');

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // CORS configuration - allow all origins in production, or specific origins from env
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  let corsOrigin: boolean | string[] = true; // Allow all by default for production

  if (allowedOriginsEnv) {
    corsOrigin = allowedOriginsEnv.split(',').map(origin => origin.trim());
  } else if (process.env.NODE_ENV !== 'production') {
    // In development, restrict to localhost
    corsOrigin = ['http://localhost:5173', 'http://localhost:3000'];
  }

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`Server running on port ${port}`);
}

bootstrap();

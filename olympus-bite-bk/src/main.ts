import { NestFactory } from '@nestjs/core';
// Disable SSL certificate rejection for local development / network proxies
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './shared/infrastructure/filters/http-exception.filter';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aumentar límite del body para imágenes base64 (hasta 20MB)
  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ extended: true, limit: '20mb' }));

  // Prefijo global para la API
  app.setGlobalPrefix('api/v1');

  // CORS para el frontend
  const allowedOrigins = [
    'http://localhost:3001',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      // Allow localhost with any port, local network IPs (e.g. 192.168.x.x, 10.x.x.x, 172.x.x.x), or Vercel deployments
      const isLocal =
        /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(
          origin,
        );
      if (
        isLocal ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtro global de excepciones
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(
    `⚡ Punto de Inflexión API running on http://localhost:${port}/api/v1`,
  );
}
bootstrap();

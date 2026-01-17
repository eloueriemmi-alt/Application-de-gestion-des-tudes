import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuration CORS pour permettre les requêtes depuis le frontend
 app.enableCors({
  origin: [
    'http://localhost:4200',
    'https://application-de-gestion-des-etudes.vercel.app',
    'https://application-de-gestion-git-2d529d-walid-eloueriemmis-projects.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
  // Validation globale
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Port dynamique pour le déploiement
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application backend démarrée sur le port ${port}`);
}
bootstrap();

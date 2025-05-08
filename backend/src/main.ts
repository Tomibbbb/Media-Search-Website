import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as yaml from 'js-yaml';
import { writeFileSync } from 'fs';

async function bootstrap() {
  // Check for required environment variables
  const requiredEnvVars = [
    'JWT_SECRET',
    'MONGODB_URI',
    'OPENVERSE_CLIENT_ID',
    'OPENVERSE_CLIENT_SECRET'
  ];
  
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please make sure all required environment variables are set in .env file');
    process.exit(1);
  }
  
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // Allow all origins for testing
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization',
    exposedHeaders: 'Content-Disposition',
  });

  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('The NestJS API documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User endpoints')
    .addTag('openverse', 'Openverse media API endpoints')
    .addTag('documentation', 'API Documentation endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.getHttpAdapter().get('/api/swagger.yaml', (req, res) => {
    try {
      const yamlString = yaml.dump(document);
      res.type('text/yaml').send(yamlString);
    } catch (error) {
      res.status(500).send('Error generating YAML');
    }
  });

  app.getHttpAdapter().get('/api/swagger.json', (req, res) => {
    try {
      res.json(document);
    } catch (error) {
      res.status(500).send('Error generating JSON');
    }
  });

  try {
    const yamlString = yaml.dump(document);
    writeFileSync('./swagger.yaml', yamlString, 'utf8');
  } catch (_error) {
    // Non-critical error
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as yaml from 'js-yaml';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe());
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('The NestJS API documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User endpoints')
    .addTag('documentation', 'API Documentation endpoints')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Add direct route for YAML
  app.getHttpAdapter().get('/api/swagger.yaml', (req, res) => {
    try {
      const yamlString = yaml.dump(document);
      res.type('text/yaml').send(yamlString);
    } catch (error) {
      console.error('Error converting Swagger to YAML:', error);
      res.status(500).send('Error generating YAML');
    }
  });
  
  // Add direct route for JSON
  app.getHttpAdapter().get('/api/swagger.json', (req, res) => {
    try {
      res.json(document);
    } catch (error) {
      console.error('Error sending Swagger JSON:', error);
      res.status(500).send('Error generating JSON');
    }
  });
  
  // Optionally save YAML to file during startup
  try {
    const yamlString = yaml.dump(document);
    writeFileSync('./swagger.yaml', yamlString, 'utf8');
    console.log('Swagger YAML file generated successfully at ./swagger.yaml');
  } catch (error) {
    console.error('Error writing Swagger YAML file:', error);
  }
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation is available at: ${await app.getUrl()}/api/docs`);
  console.log(`Swagger YAML is available at: ${await app.getUrl()}/api/swagger.yaml`);
  console.log(`Swagger JSON is available at: ${await app.getUrl()}/api/swagger.json`);
}
bootstrap();

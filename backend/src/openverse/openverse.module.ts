import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { OpenverseController } from './openverse.controller';
import { OpenverseService } from './services/openverse.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  controllers: [OpenverseController],
  providers: [OpenverseService],
  exports: [OpenverseService],
})
export class OpenverseModule {}

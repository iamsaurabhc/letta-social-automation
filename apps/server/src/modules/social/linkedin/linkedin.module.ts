import { Module } from '@nestjs/common';
import { LinkedInController } from './controllers/auth.controller';
import { LinkedInService } from './services/linkedin-api.service';

@Module({
  controllers: [LinkedInController],
  providers: [LinkedInService],
  exports: [LinkedInService]
})
export class LinkedInModule {} 
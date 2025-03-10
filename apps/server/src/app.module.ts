import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LettaModule } from './modules/letta/letta.module';
import { SocialModule } from './modules/social/social.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AppController } from './app.controller';
import { SupabaseConnectionPool } from './supabase/connection-pool.service';
import { CacheModule } from './modules/cache/cache.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [() => ({
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
        JWT_SECRET: process.env.JWT_SECRET,
        LETTA_API_URL: process.env.LETTA_API_URL,
        LETTA_PASSWORD: process.env.LETTA_PASSWORD,
        TWITTER_API_KEY: process.env.TWITTER_API_KEY,
        LINKEDIN_API_KEY: process.env.LINKEDIN_API_KEY,
        CLIENT_URL: process.env.CLIENT_URL,
        SERVER_URL: process.env.SERVER_URL,
        TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY,
        TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET,
        REDIS_HOST: process.env.REDIS_HOST || 'localhost',
        REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
        REDIS_PASSWORD: process.env.REDIS_PASSWORD,
        REDIS_TLS: process.env.NODE_ENV === 'production',
        REDIS_URL: process.env.REDIS_URL,
      })],
    }),
    ScheduleModule.forRoot(),
    SchedulerModule,
    CacheModule,
    AuthModule,
    LettaModule,
    SocialModule,
    SupabaseModule,
  ],
  controllers: [AppController],
})
export class AppModule {} 
import { Module } from '@nestjs/common';
import { LinkedInModule } from './linkedin/linkedin.module';
import { TwitterModule } from './twitter/twitter.module';
import { UserAgentController } from './controllers/user-agent.controller';
import { UserAgentService } from './services/user-agent.service';
import { WebsiteScraperService } from './services/website-scraper.service';
import { WebsiteScraperProcessor } from './processors/website-scraper.processor';
import { BullModule } from '@nestjs/bull';
import { LettaModule } from '../../modules/letta/letta.module';
import { SupabaseModule } from '../../supabase/supabase.module';
import { TwitterAuthController } from './twitter/controllers/auth.controller';
import { TwitterAuthService } from './twitter/services/auth.service';
import { TwitterApiService } from './twitter/services/twitter-api.service';
import { AuthModule } from '../../auth/auth.module';
import { ConnectionsController } from './connections/connections.controller';
import { SupabaseService } from '../../supabase/supabase.service';
import { AgentsController } from './agents/agents.controller';
import { PostService } from './posts/services/post.service';
import { TwitterPostService } from './twitter/features/posts/services/post.service';
import { BullQueueModule } from '../bull/bull.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TwitterModule,
    LinkedInModule,
    BullModule.registerQueue({
      name: 'website-scraping',
    }),
    LettaModule,
    SupabaseModule,
    AuthModule,
    CacheModule,
    BullModule.registerQueue({
      name: 'content-generation',
    }),
    BullModule.registerQueue({
      name: 'engagement-monitoring',
    }),
    BullQueueModule,
  ],
  controllers: [
    UserAgentController,
    TwitterAuthController,
    ConnectionsController,
    AgentsController
  ],
  providers: [
    UserAgentService,
    WebsiteScraperService,
    WebsiteScraperProcessor,
    TwitterAuthService,
    TwitterApiService,
    SupabaseService,
    PostService,
    TwitterPostService
  ],
  exports: [
    TwitterModule,
    LinkedInModule,
    UserAgentService,
    PostService,
    TwitterPostService
  ]
})
export class SocialModule {} 
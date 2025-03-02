import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { QUEUE_NAMES } from './bull-queues.config';

@Injectable()
export class BullQueueService {
  private readonly logger = new Logger(BullQueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.WEBSITE_SCRAPING)
    private readonly websiteScrapingQueue: Queue,
    @InjectQueue(QUEUE_NAMES.CONTENT_GENERATION)
    private readonly contentGenerationQueue: Queue,
    @InjectQueue(QUEUE_NAMES.ENGAGEMENT_MONITORING)
    private readonly engagementMonitoringQueue: Queue,
    @InjectQueue(QUEUE_NAMES.POST_PUBLISHER)
    private readonly postPublisherQueue: Queue,
    @InjectQueue(QUEUE_NAMES.TWITTER_TIMELINE)
    private readonly twitterTimelineQueue: Queue,
  ) {}

  async scheduleCustom(queueName: string, data: any, schedule: { days: string[], time: string, postsPerPeriod?: number }) {
    const queue = this.getQueue(queueName);
    const [hours, minutes] = schedule.time.split(':');
    
    // Create cron pattern for specific days and time
    const cronDays = schedule.days.map(day => day.substring(0, 3)).join(',');
    const cronPattern = `${minutes} ${hours} * * ${cronDays}`;
    
    // Add postsPerPeriod to the data
    const jobData = {
      ...data,
      postsPerPeriod: schedule.postsPerPeriod || 5
    };
    
    await queue.add(jobData, {
      repeat: {
        cron: cronPattern
      }
    });
  }

  async scheduleRecurring(queueName: string, data: any, frequency: string, postsPerPeriod: number = 5) {
    const queue = this.getQueue(queueName);
    let repeat: any = {};

    switch (frequency) {
      case 'hourly':
        repeat = { cron: '0 * * * *' };
        break;
      case 'daily':
        repeat = { cron: '0 9 * * *' }; // 9 AM every day
        break;
      case 'weekly':
        repeat = { cron: '0 9 * * 1' }; // 9 AM every Monday
        break;
      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }

    // Add postsPerPeriod to the data
    const jobData = {
      ...data,
      postsPerPeriod
    };

    await queue.add(jobData, { repeat });
  }

  async schedulePost(queueName: string, data: {
    postId: string;
    scheduledFor: Date;
    content: string;
    format: 'normal' | 'long_form';
  }) {
    const queue = this.getQueue(queueName);
    
    // Schedule the post for the specific time
    await queue.add(data, {
      delay: new Date(data.scheduledFor).getTime() - Date.now(),
      removeOnComplete: true
    });
  }

  async scheduleInitialPosts(queueName: string, data: {
    agentId: string;
    format: 'normal' | 'long_form';
    postsPerDay: number;
  }) {
    const queue = this.getQueue(queueName);
    
    // Schedule daily post generation at midnight
    await queue.add('generate-daily-posts', {
      ...data,
      type: 'daily_generation'
    }, {
      repeat: {
        cron: '0 0 * * *' // Every day at midnight
      }
    });

    // Generate initial posts for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    await queue.add('generate-initial-posts', {
      ...data,
      scheduledFor: tomorrow,
      type: 'initial_generation'
    });
  }

  // Add new method for generic queue operations
  async addToQueue(queueName: string, jobType: string, data: any) {
    const queue = this.getQueue(queueName);
    return await queue.add(jobType, data, {
      removeOnComplete: true,
      removeOnFail: true
    });
  }

  private getQueue(name: string): Queue {
    switch (name) {
      case QUEUE_NAMES.WEBSITE_SCRAPING:
        return this.websiteScrapingQueue;
      case QUEUE_NAMES.CONTENT_GENERATION:
        return this.contentGenerationQueue;
      case QUEUE_NAMES.ENGAGEMENT_MONITORING:
        return this.engagementMonitoringQueue;
      case QUEUE_NAMES.POST_PUBLISHER:
        return this.postPublisherQueue;
      case QUEUE_NAMES.TWITTER_TIMELINE:
        return this.twitterTimelineQueue;
      default:
        throw new Error(`Queue ${name} not found`);
    }
  }
} 
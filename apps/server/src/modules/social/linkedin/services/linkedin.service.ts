import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { FetchHistoricalPostsService } from '../posts/fetchHistoricalPosts';
import { CreatePostService } from '../posts/createPost';

@Injectable()
export class LinkedInService {
  private readonly logger = new Logger(LinkedInService.name);
  private readonly LINKEDIN_API_BASE: string;
  private readonly ACCESS_TOKEN: string;
  private readonly PROFILE_ID: string;

  constructor(
    private configService: ConfigService,
    private readonly fetchHistoricalPostsService: FetchHistoricalPostsService,
    private readonly createPostService: CreatePostService
  ) {
    this.LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';
    this.ACCESS_TOKEN = this.configService.get<string>('LINKEDIN_ACCESS_TOKEN');
    this.PROFILE_ID = this.configService.get<string>('LINKEDIN_PROFILE_ID');
  }

  async getPosts() {
    return this.fetchHistoricalPostsService.getPosts();
  }
  
  async createPost(postData: any) {
    return this.createPostService.createPost(postData);
  }
  async getComments(postId: string) {
    try {
      const response = await axios.get(`${this.LINKEDIN_API_BASE}/comments`, {
        headers: { Authorization: `Bearer ${this.ACCESS_TOKEN}` },
        params: { q: 'parent', parent: `urn:li:share:${postId}` },
      });
      return response.data.elements;
    } catch (error) {
      this.logger.error('Error fetching comments:', error.response?.data || error.message);
      throw new Error('Failed to fetch comments');
    }
  }
}

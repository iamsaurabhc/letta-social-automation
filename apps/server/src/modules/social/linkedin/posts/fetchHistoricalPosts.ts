import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FetchHistoricalPostsService {
  private readonly LINKEDIN_API_BASE: string;
  private readonly ACCESS_TOKEN: string;
  private readonly PROFILE_ID: string;

  constructor(private configService: ConfigService) {
    this.LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';
    this.ACCESS_TOKEN = this.configService.get<string>('LINKEDIN_ACCESS_TOKEN');
    this.PROFILE_ID = this.configService.get<string>('LINKEDIN_PROFILE_ID');
  }

  async getPosts(count = 100): Promise<any> {
    try {
      const response = await axios.get(`${this.LINKEDIN_API_BASE}/ugcPosts`, {
        headers: { Authorization: `Bearer ${this.ACCESS_TOKEN}` },
        params: {
          q: 'author',
          author: `urn:li:person:${this.PROFILE_ID}`,
          count,
        },
      });

      return response.data.elements;
    } catch (error) {
      console.error('Error fetching historical posts:', error.response?.data || error.message);
      throw new Error('Failed to fetch historical posts');
    }
  }
}

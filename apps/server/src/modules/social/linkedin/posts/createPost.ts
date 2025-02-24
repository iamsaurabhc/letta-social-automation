import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CreatePostService {
  private readonly LINKEDIN_API_BASE: string;
  private readonly ACCESS_TOKEN: string;
  private readonly PROFILE_ID: string;

  constructor(private configService: ConfigService) {
    this.LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';
    this.ACCESS_TOKEN = this.configService.get<string>('LINKEDIN_ACCESS_TOKEN');
    this.PROFILE_ID = this.configService.get<string>('LINKEDIN_PROFILE_ID');
  }

  async createPost(postData: { message: string }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.LINKEDIN_API_BASE}/ugcPosts`,
        {
          author: `urn:li:person:${this.PROFILE_ID}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: postData.message },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
        },
        {
          headers: {
            Authorization: `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating post:', error.response?.data || error.message);
      throw new Error('Failed to create post');
    }
  }
}

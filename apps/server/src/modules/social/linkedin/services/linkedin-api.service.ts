import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class LinkedInApiService {
  private readonly logger = new Logger(LinkedInApiService.name);
  private readonly LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

  constructor(private readonly configService: ConfigService) {}

  async makeLinkedInRequest<T>(
    endpoint: string,
    options: Omit<AxiosRequestConfig, 'url'> & { baseUrl?: string },
    accessToken: string,
    retryCount = 0
  ): Promise<T> {
    const MAX_RETRIES = 10;
    const BASE_DELAY = 2000;

    try {
      const baseUrl = options.baseUrl || this.LINKEDIN_API_BASE;
      const url = `${baseUrl}${endpoint}`;
      const { baseUrl: _, ...axiosOptions } = options;

      const response = await axios({
        ...axiosOptions,
        url,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(options.headers || {})
        },
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
        const waitTime = this.calculateRetryDelay(error.response, retryCount, BASE_DELAY);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.makeLinkedInRequest(endpoint, options, accessToken, retryCount + 1);
      }

      this.logger.error(`LinkedIn API request failed: ${error.message}`);
      throw error;
    }
  }

  private calculateRetryDelay(response: any, retryCount: number, baseDelay: number): number {
    const resetTime = response.headers?.['x-rate-limit-reset'];
    return resetTime
      ? (parseInt(resetTime) * 1000) - Date.now()
      : Math.min(Math.pow(2, retryCount) * baseDelay, 60000);
  }

  async makeRawRequest<T>(url: string, options: AxiosRequestConfig): Promise<T> {
    const response = await axios({
      ...options,
      url,
    });
    return response.data;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '@/supabase/supabase.service';
import axios from 'axios';

@Injectable()
export class LinkedInAuthService {
  private readonly logger = new Logger(LinkedInAuthService.name);
  private readonly LINKEDIN_OAUTH_URL = 'https://www.linkedin.com/oauth/v2';
  private readonly LINKEDIN_API_URL = 'https://api.linkedin.com/v2';

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getAuthorizationUrl(userId: string, agentId: string): Promise<string> {
    const clientId = this.configService.get<string>('LINKEDIN_CLIENT_ID');
    const redirectUri = `${this.configService.get('SERVER_URL')}/api/social/linkedin/auth/callback`;
    const state = encodeURIComponent(JSON.stringify({ userId, agentId }));

    return `${this.LINKEDIN_OAUTH_URL}/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
  }

  async handleCallback(code: string, state: string): Promise<{ redirectUrl: string }> {
    try {
      const stateData = JSON.parse(decodeURIComponent(state));
      const { userId, agentId } = stateData;

      if (!userId || !agentId) {
        throw new Error('Invalid state parameter');
      }

      const clientId = this.configService.get<string>('LINKEDIN_CLIENT_ID');
      const clientSecret = this.configService.get<string>('LINKEDIN_CLIENT_SECRET');
      const redirectUri = `${this.configService.get('SERVER_URL')}/api/social/linkedin/auth/callback`;

      const tokenResponse = await axios.post(`${this.LINKEDIN_OAUTH_URL}/accessToken`, null, {
        params: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        },
      });

      const { access_token, expires_in } = tokenResponse.data;

      const profileResponse = await axios.get(`${this.LINKEDIN_API_URL}/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const { id, localizedFirstName, localizedLastName } = profileResponse.data;

      await this.supabaseService.client
        .from('social_connections')
        .insert({
          user_id: userId,
          agent_id: agentId,
          platform: 'linkedin',
          access_token: access_token,
          refresh_token: null,
          username: `${localizedFirstName} ${localizedLastName}`,
          token_expires_at: new Date(Date.now() + expires_in * 1000),
          platform_settings: {},
        });

      const clientUrl = this.configService.get<string>('CLIENT_URL');

      return {
        redirectUrl: `${clientUrl}/dashboard/automation?step=social&status=success&linkedinData=${encodeURIComponent(JSON.stringify({ id, firstName: localizedFirstName, lastName: localizedLastName }))}&agentId=${agentId}`,
      };
    } catch (error) {
      this.logger.error('LinkedIn callback error:', error);
      throw error;
    }
  }
}

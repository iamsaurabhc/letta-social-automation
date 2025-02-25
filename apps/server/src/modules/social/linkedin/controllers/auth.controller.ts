import { Controller, Get, Req, Res, UseGuards, Logger, UnauthorizedException, BadRequestException, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../../auth/guards/jwt.guard';
import { LinkedInAuthService } from '../services/auth.service';

// Custom interface for the request with user property
interface AuthenticatedRequest {
  user: {
    id: string;
    [key: string]: any;
  };
  query: {
    code?: string;
    state?: string;
    [key: string]: string | undefined;
  };
}

@Controller('social/linkedin/auth')
export class LinkedInAuthController {
  private readonly logger = new Logger(LinkedInAuthController.name);
  
  constructor(
    private readonly configService: ConfigService,
    private readonly linkedinAuthService: LinkedInAuthService,
  ) {}

  @Get('url')
  @UseGuards(JwtAuthGuard)
  async getAuthUrl(
    @Req() request: AuthenticatedRequest,
    @Query('agentId') agentId: string
  ) {
    if (!request.user?.id) {
      this.logger.error('No user ID in request');
      throw new UnauthorizedException('User not authenticated');
    }
    
    if (!agentId) {
      this.logger.error('No agent ID provided');
      throw new BadRequestException('Agent ID is required');
    }
    
    this.logger.debug('Getting LinkedIn auth URL');
    this.logger.debug(`User ID from request: ${request.user.id}`);
    this.logger.debug(`Agent ID from request: ${agentId}`);
    
    try {
      const authUrl = await this.linkedinAuthService.getAuthorizationUrl(request.user.id, agentId);
      this.logger.debug(`Auth URL generated: ${authUrl}`);
      return { url: authUrl };
    } catch (error) {
      this.logger.error('Failed to get auth URL:', error);
      throw new BadRequestException(error.message);
    }
  }

  @Get('callback')
  async handleCallback(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ) {
    const { code, state } = request.query;
    
    try {
      if (!code) {
        throw new Error('Missing authorization code');
      }

      if (!state) {
        throw new Error('Missing state parameter');
      }

      const { redirectUrl } = await this.linkedinAuthService.handleCallback(
        code as string,
        state as string
      );
      
      return response.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('LinkedIn auth error:', error);
      const clientUrl = this.configService.get('CLIENT_URL');
      const errorMessage = encodeURIComponent(error.message || 'Failed to authenticate with LinkedIn');
      return response.redirect(`${clientUrl}/dashboard/automation?step=social&status=error&message=${errorMessage}`);
    }
  }
}

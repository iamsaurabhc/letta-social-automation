import { Injectable, Logger } from '@nestjs/common';
import { LinkedInApiService } from '../../../linkedin/services/linkedin-api.service';

@Injectable()
export class LinkedInPostService {
  private readonly logger = new Logger(LinkedInPostService.name);

  constructor(private readonly linkedinApiService: LinkedInApiService) {}

  async getPosts(auth: { accessToken: string }) {
    this.logger.log('Fetching LinkedIn posts');
    return this.linkedinApiService.makeLinkedInRequest('/ugcPosts', { method: 'GET' }, auth.accessToken);
  }

  async createPost(auth: { accessToken: string }, postData: { text: string; mediaId?: string }) {
    this.logger.log('Creating LinkedIn post');
    const data: any = {
      author: `urn:li:person:${auth.accessToken}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: postData.text },
          shareMediaCategory: postData.mediaId ? 'IMAGE' : 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };

    if (postData.mediaId) {
      data.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        media: postData.mediaId,
      }];
    }

    return this.linkedinApiService.makeLinkedInRequest(
      '/ugcPosts',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data,
      },
      auth.accessToken
    );
  }

  async createPostWithMedia(auth: { accessToken: string }, text: string, fileBuffer: Buffer, mimeType: string) {
    this.logger.log('Uploading media to LinkedIn');
    const mediaId = await this.uploadMedia(auth, fileBuffer, mimeType);
    return this.createPost(auth, { text, mediaId });
  }

  async uploadMedia(auth: { accessToken: string }, fileBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      const registerResponse = await this.linkedinApiService.makeLinkedInRequest(
        '/assets?action=registerUpload',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: {
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: `urn:li:person:${auth.accessToken}`,
              serviceRelationships: [
                {
                  relationshipType: 'OWNER',
                  identifier: 'urn:li:userGeneratedContent',
                },
              ],
            },
          },
        },
        auth.accessToken
      );

      const uploadUrl = registerResponse.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const mediaId = registerResponse.value.asset;

      await this.linkedinApiService.makeRawRequest(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': mimeType },
        data: fileBuffer,
      });

      return mediaId;
    } catch (error) {
      this.logger.error('Error uploading media:', error);
      throw new Error('Failed to upload media');
    }
  }

  async getPostDetails(auth: { accessToken: string }, postId: string) {
    this.logger.log(`Fetching LinkedIn post details: ${postId}`);
    return this.linkedinApiService.makeLinkedInRequest(
      `/ugcPosts/${postId}`,
      { method: 'GET' },
      auth.accessToken
    );
  }

  async getPostComments(auth: { accessToken: string }, postId: string) {
    this.logger.log(`Fetching LinkedIn post comments: ${postId}`);
    return this.linkedinApiService.makeLinkedInRequest(
      `/comments?q=parent&parent=urn:li:share:${postId}`,
      { method: 'GET' },
      auth.accessToken
    );
  }

  async commentOnPost(auth: { accessToken: string }, postId: string, text: string) {
    this.logger.log(`Commenting on LinkedIn post: ${postId}`);
    return this.linkedinApiService.makeLinkedInRequest(
      '/comments',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          parent: `urn:li:share:${postId}`,
          message: { text },
        },
      },
      auth.accessToken
    );
  }

  async deletePost(auth: { accessToken: string }, postId: string) {
    this.logger.log(`Deleting LinkedIn post: ${postId}`);
    return this.linkedinApiService.makeLinkedInRequest(
      `/ugcPosts/${postId}`,
      { method: 'DELETE' },
      auth.accessToken
    );
  }
}

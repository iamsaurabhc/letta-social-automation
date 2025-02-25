import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LinkedInPostService } from '../services/post.service';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt.guard';

@Controller('social/linkedin/posts')
@UseGuards(JwtAuthGuard)
export class LinkedInPostController {
  constructor(private readonly postService: LinkedInPostService) {}

  @Get()
  async getPosts(@Request() req) {
    return this.postService.getPosts(req.user.linkedin.auth);
  }

  @Post()
  async createPost(@Request() req, @Body() postData: { text: string }) {
    return this.postService.createPost(req.user.linkedin.auth, postData);
  }

  @Post('with-media')
  @UseInterceptors(FileInterceptor('file'))
  async createPostWithMedia(
    @Request() req,
    @Body() postData: { text: string },
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.postService.createPostWithMedia(req.user.linkedin.auth, postData.text, file.buffer, file.mimetype);
  }

  @Get(':id')
  async getPostDetails(@Request() req, @Param('id') id: string) {
    return this.postService.getPostDetails(req.user.linkedin.auth, id);
  }

  @Get(':id/comments')
  async getPostComments(@Request() req, @Param('id') id: string) {
    return this.postService.getPostComments(req.user.linkedin.auth, id);
  }

  @Post(':id/comment')
  async commentOnPost(@Request() req, @Param('id') id: string, @Body() commentData: { text: string }) {
    return this.postService.commentOnPost(req.user.linkedin.auth, id, commentData.text);
  }

  @Delete(':id')
  async deletePost(@Request() req, @Param('id') id: string) {
    return this.postService.deletePost(req.user.linkedin.auth, id);
  }
}

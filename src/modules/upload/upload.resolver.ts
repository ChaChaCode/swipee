import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UploadService } from './upload.service';
import { PresignedUpload } from './models/upload.model';

@Resolver()
export class UploadResolver {
  constructor(private uploadService: UploadService) {}

  @Mutation(() => PresignedUpload)
  async getUploadUrl(
    @Args('userId') userId: string,
    @Args('mimeType', { defaultValue: 'image/jpeg' }) mimeType: string,
  ): Promise<PresignedUpload> {
    return this.uploadService.getPresignedUploadUrl(userId, mimeType);
  }

  @Mutation(() => Boolean)
  async deletePhoto(@Args('key') key: string): Promise<boolean> {
    await this.uploadService.deleteFile(key);
    return true;
  }
}

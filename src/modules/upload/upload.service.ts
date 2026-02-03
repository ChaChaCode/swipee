import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createId } from '@paralleldrive/cuid2';

export interface UploadResult {
  key: string;
  url: string;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucketName: string;
  private endpointUrl: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('YANDEX_BUCKET_NAME') || 'swipee';
    this.endpointUrl = this.configService.get<string>('YANDEX_ENDPOINT_URL') || 'https://storage.yandexcloud.net';

    this.s3Client = new S3Client({
      endpoint: this.endpointUrl,
      region: this.configService.get<string>('YANDEX_REGION') || 'ru-central1',
      credentials: {
        accessKeyId: this.configService.get<string>('YANDEX_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('YANDEX_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async uploadFile(
    buffer: Buffer,
    userId: string,
    mimeType: string,
  ): Promise<UploadResult> {
    const extension = this.getExtension(mimeType);
    const key = `photos/${userId}/${createId()}.${extension}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
      }),
    );

    return {
      key,
      url: this.getPublicUrl(key),
    };
  }

  async getPresignedUploadUrl(
    userId: string,
    mimeType: string,
  ): Promise<PresignedUploadResult> {
    const extension = this.getExtension(mimeType);
    const key = `photos/${userId}/${createId()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: mimeType,
      ACL: 'public-read',
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return {
      uploadUrl,
      key,
      publicUrl: this.getPublicUrl(key),
    };
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }

  getPublicUrl(key: string): string {
    return `${this.endpointUrl}/${this.bucketName}/${key}`;
  }

  private getExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    return mimeToExt[mimeType] || 'jpg';
  }
}

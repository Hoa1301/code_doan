import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('minio.endpoint') || 'localhost',
      port: this.configService.get<number>('minio.port') || 9000,
      useSSL: this.configService.get<boolean>('minio.useSSL') || false,
      accessKey: this.configService.get<string>('minio.accessKey') || 'minioadmin',
      secretKey: this.configService.get<string>('minio.secretKey') || 'minioadmin',
    });
    this.bucketName = this.configService.get<string>('minio.bucket') || 'tts-learning';
  }

  async onModuleInit() {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      this.logger.log(`Bucket "${this.bucketName}" created successfully.`);
    } else {
      this.logger.log(`Bucket "${this.bucketName}" already exists.`);
    }
  }

  async uploadFile(fileName: string, file: Buffer, mimeType: string) {
    const metaData = {
      'Content-Type': mimeType,
    };
    await this.minioClient.putObject(this.bucketName, fileName, file, file.length, metaData);
    return fileName;
  }

  async getFileUrl(fileName: string) {
    return await this.minioClient.presignedGetObject(this.bucketName, fileName, 24 * 60 * 60); // 24 hours
  }

  async deleteFile(fileName: string) {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }
}

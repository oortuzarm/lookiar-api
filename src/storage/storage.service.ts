import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    const region = config.get<string>('aws.region');
    const bucket = config.get<string>('aws.bucket');

    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId: config.get<string>('aws.accessKeyId'),
        secretAccessKey: config.get<string>('aws.secretAccessKey'),
      },
    });

    this.bucket = bucket;

    const cfUrl = config.get<string>('aws.cloudfrontUrl');
    this.baseUrl = cfUrl
      ? cfUrl.replace(/\/$/, '')
      : `https://${bucket}.s3.${region}.amazonaws.com`;
  }

  async upload(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<{ key: string; url: string }> {
    const ext = path.extname(file.originalname).toLowerCase();
    const key = `${folder}/${nanoid(16)}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return { key, url: `${this.baseUrl}/${key}` };
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}

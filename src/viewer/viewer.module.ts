import { Module } from '@nestjs/common';
import { ViewerController } from './viewer.controller';

@Module({
  controllers: [ViewerController],
})
export class ViewerModule {}

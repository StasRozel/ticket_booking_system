import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { UsersModule } from '../users/users.module';
import { BusschedulesModule } from '../busschedules/busschedules.module';

@Module({
  imports: [UsersModule, BusschedulesModule],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class SocketModule {}

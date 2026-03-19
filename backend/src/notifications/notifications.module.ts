import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { TelegramService } from './telegram.service';
import { JwtService } from 'src/users/jwt.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Booking])],
  controllers: [NotificationsController],
  providers: [NotificationsService, UsersService, TelegramService, JwtService],
})
export class NotificationsModule {}

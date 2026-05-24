import './polyfills/crypto';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getTypeOrmConfig } from './config/db.config';
import { SchedulesModule } from './schedules/schedules.module';
import { UrgentcallsModule } from './urgentcalls/urgentcalls.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DriversModule } from './drivers/drivers.module';
import { RoutesModule } from './routes/routes.module';
import { BusschedulesModule } from './busschedules/busschedules.module';
import { BookingsModule } from './bookings/bookings.module';
import { BusesModule } from './buses/buses.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SocketModule } from './socket/socket.module';
import { SeatReservationsModule } from './seat-reservations/seat-reservations.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),

    ScheduleModule.forRoot(),

    UsersModule,
    TicketsModule,
    BusesModule,
    BookingsModule,
    BusschedulesModule,
    RoutesModule,
    DriversModule,
    NotificationsModule,
    ComplaintsModule,
    UrgentcallsModule,
    SchedulesModule,
    SocketModule,
    SeatReservationsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

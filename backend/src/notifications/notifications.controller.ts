import { Body, Controller, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('/register')
  async register(@Body() data: { userId: number; chatId: string }) {
    return this.notificationsService.register(data);
  }

  @Post('/arrival')
  async notifyArrival(
    @Body()
    data: {
      userId?: number;
      chatId?: string;
      routeName: string;
      stopName: string;
    },
  ) {
    return this.notificationsService.notifyArrival(data);
  }

  @Post('/arrival/schedule')
  async notifyArrivalForSchedule(
    @Body()
    data: {
      bus_schedule_id: number;
      routeName?: string;
      stopName: string;
    },
  ) {
    return this.notificationsService.notifyArrivalForSchedule(data);
  }

  @Post('/delay')
  async notifyDelay(
    @Body()
    data: {
      userId?: number;
      chatId?: string;
      routeName: string;
      minutes: number;
      reason?: string;
    },
  ) {
    return this.notificationsService.notifyDelay(data);
  }

  @Post('/delay/schedule')
  async notifyDelayForSchedule(
    @Body()
    data: {
      bus_schedule_id: number;
      routeName?: string;
      minutes: number;
      reason?: string;
    },
  ) {
    return this.notificationsService.notifyDelayForSchedule(data);
  }
}

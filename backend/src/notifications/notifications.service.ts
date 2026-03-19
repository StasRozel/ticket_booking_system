import {
  BadRequestException,
  Body,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { Booking } from 'src/bookings/entities/booking.entity';
import { TelegramService } from './telegram.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private telegramService: TelegramService,
  ) {}

  async findAllByBusScheduleId(bus_schedule_id: number): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { bus_schedule_id },
      relations: ['user', 'tickets'],
    });
  }

  async register(@Body() data: { userId: number; chatId: string }) {
    const user = await this.userRepository.findOneBy({ id: data.userId });
    if (!user) throw new NotFoundException(404, 'User not found');
    await this.userRepository.update(data.userId, {
      telegram_chat_id: data.chatId,
    } as UpdateUserDto);
    return { success: true };
  }

  async notifyArrival(
    @Body()
    data: {
      userId?: number;
      chatId?: string;
      routeName: string;
      stopName: string;
    },
  ) {
    let chatId = data.chatId;
    if (!chatId && data.userId) {
      const user = await this.userRepository.findOneById(data.userId);
      if (!user) throw new NotFoundException(404, 'User not found');
      chatId = user.telegram_id;
    }
    if (!chatId)
      throw new BadRequestException(400, 'chatId or userId required');

    const text = `Маршрутка \u003Cb\u003E${data.routeName}\u003C/b\u003E прибывает на остановку <b>${data.stopName}</b>. Пожалуйста, приготовьтесь к посадке.`;
    await this.telegramService.sendTelegramMessage(chatId, text);
    return { success: true };
  }

  async notifyArrivalForSchedule(
    @Body()
    data: {
      bus_schedule_id: number;
      routeName?: string;
      stopName: string;
    },
  ) {
    if (!data || !data.bus_schedule_id)
      throw new Error('bus_schedule_id required');

    const bookings = await this.findAllByBusScheduleId(data.bus_schedule_id);
    const results: Array<{
      bookingId: number;
      sent: boolean;
      reason?: string;
    }> = [];

    for (const b of bookings) {
      try {
        const user = (b as any).user;
        if (!user || !user.telegram_id) {
          results.push({
            bookingId: b.id as number,
            sent: false,
            reason: 'no telegram_id',
          });
          continue;
        }

        const chatId = user.telegram_id as string;
        const routeName =
          data.routeName ||
          (b as any).busSchedule?.schedule?.route?.name ||
          'маршрут';
        const stopName = data.stopName || 'остановке';
        const text = `Маршрутка <b>${routeName}</b> прибывает на остановку <b>${stopName}</b>. Пожалуйста, приготовьтесь.`;

        await this.telegramService.sendTelegramMessage(chatId, text);
        results.push({ bookingId: b.id as number, sent: true });
      } catch (err: any) {
        results.push({
          bookingId: b.id as number,
          sent: false,
          reason: err?.message || String(err),
        });
      }
    }

    return { success: true, results };
  }

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
    let chatId = data.chatId;
    if (!chatId && data.userId) {
      const user = await this.userRepository.findOneBy({ id: data.userId });
      if (!user) throw new NotFoundException(404, 'User not found');
      chatId = user.telegram_id;
    }
    if (!chatId)
      throw new BadRequestException(400, 'chatId or userId required');

    const text = `Рейс \u003Cb\u003E${data.routeName}\u003C/b\u003E задерживается на ${data.minutes} минут. ${data.reason ? 'Причина: ' + data.reason : ''}`;
    await this.telegramService.sendTelegramMessage(chatId, text);
    return { success: true };
  }

  async notifyDelayForSchedule(
    @Body()
    data: {
      bus_schedule_id: number;
      routeName?: string;
      minutes: number;
      reason?: string;
    },
  ) {
    if (!data || !data.bus_schedule_id)
      throw new Error('bus_schedule_id required');

    const bookings = await this.findAllByBusScheduleId(data.bus_schedule_id);
    const results: Array<{
      bookingId: number;
      sent: boolean;
      reason?: string;
    }> = [];

    for (const b of bookings) {
      try {
        const user = (b as any).user;
        if (!user || !user.telegram_id) {
          results.push({
            bookingId: b.id as number,
            sent: false,
            reason: 'no telegram_id',
          });
          continue;
        }

        const chatId = user.telegram_id as string;
        const routeName =
          data.routeName ||
          (b as any).busSchedule?.schedule?.route?.name ||
          'маршрут';
        const minutes = data.minutes;
        const text = `Рейс <b>${routeName}</b> задерживается на ${minutes} минут. ${data.reason ? 'Причина: ' + data.reason : ''}`;

        await this.telegramService.sendTelegramMessage(chatId, text);
        results.push({ bookingId: b.id as number, sent: true });
      } catch (err: any) {
        results.push({
          bookingId: b.id as number,
          sent: false,
          reason: err?.message || String(err),
        });
      }
    }

    return { success: true, results };
  }
}

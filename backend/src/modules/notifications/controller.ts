import 'reflect-metadata';
import { Controller, Body, Post, HttpError } from 'routing-controllers';
import { userRepository } from '../auth/repository/repository';
import { sendTelegramMessage } from './telegramService';
import { bookingRepository } from '../bookings/repository/repository';

@Controller('/api/notifications')
export class NotificationsController {
  @Post('/register')
  async register(@Body() data: { userId: number; chatId: string }) {
    const user = await userRepository.findOneById(data.userId);
    if (!user) throw new HttpError(404, 'User not found');
    await userRepository.update(data.userId, { telegram_chat_id: data.chatId } as any);
    return { success: true };
  }

  @Post('/arrival')
  async notifyArrival(@Body() data: { userId?: number; chatId?: string; routeName: string; stopName: string }) {
    let chatId = data.chatId;
    if (!chatId && data.userId) {
      const user = await userRepository.findOneById(data.userId);
      if (!user) throw new HttpError(404, 'User not found');
      chatId = user.telegram_id as string;
    }
    if (!chatId) throw new HttpError(400, 'chatId or userId required');

    const text = `Маршрутка \u003Cb\u003E${data.routeName}\u003C/b\u003E прибывает на остановку <b>${data.stopName}</b>. Пожалуйста, приготовьтесь.`;
    await sendTelegramMessage(chatId, text);
    return { success: true };
  }

  @Post('/arrival/schedule')
  async notifyArrivalForSchedule(@Body() data: { bus_schedule_id: number; routeName?: string; stopName: string }) {
    if (!data || !data.bus_schedule_id) throw new Error('bus_schedule_id required');

    const bookings = await bookingRepository.findAllByBusScheduleId(data.bus_schedule_id);
    const results: Array<{ bookingId: number; sent: boolean; reason?: string }> = [];

    for (const b of bookings) {
      try {
        const user = (b as any).user;
        if (!user || !user.telegram_id) {
          results.push({ bookingId: b.id as number, sent: false, reason: 'no telegram_id' });
          continue;
        }

        const chatId = user.telegram_id as string;
        const routeName = data.routeName || (b as any).busSchedule?.schedule?.route?.name || 'маршрут';
        const stopName = data.stopName || 'остановке';
        const text = `Маршрутка <b>${routeName}</b> прибывает на остановку <b>${stopName}</b>. Пожалуйста, приготовьтесь.`;

        await sendTelegramMessage(chatId, text);
        results.push({ bookingId: b.id as number, sent: true });
      } catch (err: any) {
        results.push({ bookingId: b.id as number, sent: false, reason: err?.message || String(err) });
      }
    }

    return { success: true, results };
  }

  @Post('/delay')
  async notifyDelay(@Body() data: { userId?: number; chatId?: string; routeName: string; minutes: number; reason?: string }) {
    let chatId = data.chatId;
    if (!chatId && data.userId) {
      const user = await userRepository.findOneById(data.userId);
      if (!user) throw new HttpError(404, 'User not found');
      chatId = user.telegram_id as string;
    }
    if (!chatId) throw new HttpError(400, 'chatId or userId required');

    const text = `Рейс \u003Cb\u003E${data.routeName}\u003C/b\u003E задерживается на ${data.minutes} минут. ${data.reason ? 'Причина: ' + data.reason : ''}`;
    await sendTelegramMessage(chatId, text);
    return { success: true };
  }

  @Post('/delay/schedule')
  async notifyDelayForSchedule(@Body() data: { bus_schedule_id: number; routeName?: string; minutes: number; reason?: string }) {
    if (!data || !data.bus_schedule_id) throw new Error('bus_schedule_id required');

    const bookings = await bookingRepository.findAllByBusScheduleId(data.bus_schedule_id);
    const results: Array<{ bookingId: number; sent: boolean; reason?: string }> = [];

    for (const b of bookings) {
      try {
        const user = (b as any).user;
        if (!user || !user.telegram_id) {
          results.push({ bookingId: b.id as number, sent: false, reason: 'no telegram_id' });
          continue;
        }

        const chatId = user.telegram_id as string;
        const routeName = data.routeName || (b as any).busSchedule?.schedule?.route?.name || 'маршрут';
        const minutes = data.minutes;
        const text = `Рейс <b>${routeName}</b> задерживается на ${minutes} минут. ${data.reason ? 'Причина: ' + data.reason : ''}`;

        await sendTelegramMessage(chatId, text);
        results.push({ bookingId: b.id as number, sent: true });
      } catch (err: any) {
        results.push({ bookingId: b.id as number, sent: false, reason: err?.message || String(err) });
      }
    }

    return { success: true, results };
  }
}

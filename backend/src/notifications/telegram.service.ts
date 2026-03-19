import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  private bot: Telegraf;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.bot = new Telegraf(configService.getOrThrow('TELEGRAM_BOT_TOKEN'));
    this.botStart();
  }

  botStart() {
    this.bot.start(async (ctx) => {
      const text = ctx.message?.text || '';
      const parts = text.split(' ');
      const payload = parts[1];
      if (payload) {
        const userId = Number(payload);
        if (!Number.isNaN(userId)) {
          try {
            await this.userRepository.update(userId, {
              telegram_id: String(ctx.chat.id),
            } as UpdateUserDto);
            await ctx.reply('Успешно зарегистрированы для уведомлений.');
            return;
          } catch (err) {
            console.error('[telegram] register via /start failed', err);
          }
        }
      }
      await ctx.reply(
        'Привет! Чтобы получать уведомления, отправьте команду /register <ваш_userId>.',
      );
    });

    this.bot.command('register', async (ctx) => {
      try {
        const text = ctx.message?.text || '';
        const parts = text.split(' ');
        const userId = Number(parts[1]);
        if (!userId || Number.isNaN(userId)) {
          await ctx.reply('Укажите правильно ваш userId: /register 123');
          return;
        }
        await this.userRepository.update(userId, {
          telegram_id: String(ctx.chat.id),
        } as UpdateUserDto);
        await ctx.reply('Успешно зарегистрированы для уведомлений.');
      } catch (err) {
        console.error('[telegram] register failed', err);
        await ctx.reply('Не удалось зарегистрировать. Попробуйте позже.');
      }
    });

    this.bot
      .launch()
      .then(() => console.log('[telegram] bot started'))
      .catch((e) => console.error('[telegram] bot launch error', e));
  }

  async sendTelegramMessage(chatId: string | number, text: string) {
    if (this.bot) {
      try {
        await this.bot.telegram.sendMessage(String(chatId), text, {
          parse_mode: 'HTML',
        });
        return;
      } catch (err) {
        console.error('[telegram] bot sendMessage failed', err?.message || err);
      }
    }
    // Fallback: if bot not available, try nothing (or you could implement axios fallback)
    console.warn('[telegram] bot not available, message not sent');
  }
}

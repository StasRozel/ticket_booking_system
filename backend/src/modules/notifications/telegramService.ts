import { Telegraf } from 'telegraf';
import { userRepository } from '../auth/repository/repository';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

let bot: Telegraf | null = null;

if (BOT_TOKEN) {
  bot = new Telegraf(BOT_TOKEN);

  bot.start(async (ctx) => {
    const text = ctx.message?.text || '';
    const parts = text.split(' ');
    const payload = parts[1];
    if (payload) {
      const userId = Number(payload);
      if (!Number.isNaN(userId)) {
        try {
          await userRepository.update(userId, { telegram_id: String(ctx.chat.id) } as any);
          await ctx.reply('Успешно зарегистрированы для уведомлений.');
          return;
        } catch (err) {
          console.error('[telegram] register via /start failed', err);
        }
      }
    }
    await ctx.reply('Привет! Чтобы получать уведомления, отправьте команду /register <ваш_userId>.');
  });

  bot.command('register', async (ctx) => {
    try {
      const text = ctx.message?.text || '';
      const parts = text.split(' ');
      const userId = Number(parts[1]);
      if (!userId || Number.isNaN(userId)) {
        await ctx.reply('Укажите правильно ваш userId: /register 123');
        return;
      }
      await userRepository.update(userId, { telegram_id: String(ctx.chat.id) } as any);
      await ctx.reply('Успешно зарегистрированы для уведомлений.');
    } catch (err) {
      console.error('[telegram] register failed', err);
      await ctx.reply('Не удалось зарегистрировать. Попробуйте позже.');
    }
  });

  bot.launch().then(() => console.log('[telegram] bot started')).catch((e) => console.error('[telegram] bot launch error', e));
} else {
  console.warn('[telegram] TELEGRAM_BOT_TOKEN not set — bot disabled');
}

export async function sendTelegramMessage(chatId: string | number, text: string) {
  if (bot) {
    try {
      await bot.telegram.sendMessage(String(chatId), text, { parse_mode: 'HTML' });
      return;
    } catch (err) {
      console.error('[telegram] bot sendMessage failed', err?.message || err);
    }
  }
  // Fallback: if bot not available, try nothing (or you could implement axios fallback)
  console.warn('[telegram] bot not available, message not sent');
}

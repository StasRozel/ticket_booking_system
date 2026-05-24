import { Test, TestingModule } from '@nestjs/testing';
import { TelegramService } from './telegram.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

jest.mock('telegraf', () => ({
  Telegraf: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    command: jest.fn(),
    launch: jest.fn().mockResolvedValue(undefined),
    telegram: {
      sendMessage: jest.fn().mockResolvedValue(undefined),
    },
  })),
}));

describe('TelegramService', () => {
  let service: TelegramService;

  const mockUserRepository = {
    update: jest.fn(),
  };
  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('fake-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = module.get<TelegramService>(TelegramService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('sendTelegramMessage', () => {
    it('should send message via bot.telegram.sendMessage', async () => {
      await service.sendTelegramMessage('chat1', 'Hello');
      expect((service as any).bot.telegram.sendMessage).toHaveBeenCalledWith(
        'chat1',
        'Hello',
        { parse_mode: 'HTML' },
      );
    });
  });
});

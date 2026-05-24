import { Test, TestingModule } from '@nestjs/testing';
import { AppGateway } from './app.gateway';
import { UsersService } from '../users/users.service';
import { BusschedulesService } from '../busschedules/busschedules.service';

describe('AppGateway', () => {
  let gateway: AppGateway;

  const mockUsersService = {
    update: jest.fn(),
  };
  const mockBusScheduleService = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppGateway,
        { provide: UsersService, useValue: mockUsersService },
        { provide: BusschedulesService, useValue: mockBusScheduleService },
      ],
    }).compile();
    gateway = module.get<AppGateway>(AppGateway);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should generate clientId and emit init', () => {
      (gateway as any).server = { emit: jest.fn() };
      const socket = {
        data: {},
        emit: jest.fn(),
        id: 'socket-1',
      } as any;
      gateway.handleConnection(socket);
      expect(socket.data.clientId).toBeDefined();
      expect(socket.emit).toHaveBeenCalledWith('init', {
        type: 'init',
        clientId: socket.data.clientId,
      });
    });
  });

  describe('handleDisconnect', () => {
    it('should remove client', () => {
      (gateway as any).server = { emit: jest.fn() };
      const socket = { data: { clientId: 'abc' }, id: 'socket-1' } as any;
      gateway.handleDisconnect(socket);
    });
  });

  describe('handleSetBlock', () => {
    it('should update user block status and emit', async () => {
      const server = { emit: jest.fn() };
      (gateway as any).server = server;
      mockUsersService.update.mockResolvedValue(undefined);

      const result = await gateway.handleSetBlock({ userId: 1, is_blocked: true });
      expect(result).toEqual({ success: true });
      expect(mockUsersService.update).toHaveBeenCalledWith(1, { is_blocked: true });
      expect(server.emit).toHaveBeenCalledWith('blocked', 1);
    });
  });

  describe('handleNewBusSchedule', () => {
    it('should create and emit update', async () => {
      const server = { emit: jest.fn() };
      (gateway as any).server = server;
      mockBusScheduleService.create.mockResolvedValue(undefined);

      await gateway.handleNewBusSchedule({ schedule_id: 1, bus_id: 1, operating_days: '1' } as any);
      expect(server.emit).toHaveBeenCalledWith('update');
    });
  });

  describe('handleUpdateBusSchedule', () => {
    it('should update and emit update', async () => {
      const server = { emit: jest.fn() };
      (gateway as any).server = server;
      mockBusScheduleService.update.mockResolvedValue(undefined);

      await gateway.handleUpdateBusSchedule({ id: 1, bus_id: 2 } as any);
      expect(mockBusScheduleService.update).toHaveBeenCalledWith(1, { id: 1, bus_id: 2 });
      expect(server.emit).toHaveBeenCalledWith('update');
    });
  });

  describe('handleDeleteBusSchedule', () => {
    it('should remove and emit update', async () => {
      const server = { emit: jest.fn() };
      (gateway as any).server = server;
      mockBusScheduleService.remove.mockResolvedValue(undefined);

      await gateway.handleDeleteBusSchedule(1);
      expect(mockBusScheduleService.remove).toHaveBeenCalledWith(1);
      expect(server.emit).toHaveBeenCalledWith('update');
    });
  });

  describe('signaling', () => {
    it('should handle offer to specific client', () => {
      const targetSocket = { connected: true, emit: jest.fn() };
      const clients = new Map();
      clients.set('target-id', targetSocket);
      (gateway as any).clients = clients;

      const senderSocket = { data: { clientId: 'sender-id' } } as any;
      gateway.handleOffer({ target: 'target-id', offer: 'sdp' }, senderSocket);
      expect(targetSocket.emit).toHaveBeenCalledWith('offer', {
        type: 'offer',
        from: 'sender-id',
        target: 'target-id',
        offer: 'sdp',
      });
    });

    it('should broadcast offer to all other clients', () => {
      const client1 = { connected: true, emit: jest.fn() };
      const client2 = { connected: true, emit: jest.fn() };
      const clients = new Map();
      clients.set('sender-id', client1);
      clients.set('other-id', client2);
      (gateway as any).clients = clients;

      const senderSocket = { data: { clientId: 'sender-id' } } as any;
      gateway.handleBroadcastOffer({ offer: 'sdp' }, senderSocket);
      expect(client2.emit).toHaveBeenCalledWith('offer', {
        type: 'offer',
        from: 'sender-id',
        offer: 'sdp',
      });
      expect(client1.emit).not.toHaveBeenCalled();
    });

    it('handleWhoami should emit init and clients', () => {
      const socket = {
        data: { clientId: 'my-id' },
        emit: jest.fn(),
      } as any;
      (gateway as any).clients = new Map();
      (gateway as any).clients.set('my-id', socket);

      gateway.handleWhoami(socket);
      expect(socket.emit).toHaveBeenCalledWith('init', {
        type: 'init',
        clientId: 'my-id',
      });
      expect(socket.emit).toHaveBeenCalledWith('clients', {
        type: 'clients',
        clients: ['my-id'],
        count: 1,
      });
    });
  });
});

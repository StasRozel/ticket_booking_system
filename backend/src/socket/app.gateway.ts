import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import { BusschedulesService } from '../busschedules/busschedules.service';
import { UpdateBusscheduleDto } from '../busschedules/dto/update-busschedule.dto';
import { CreateBusscheduleDto } from '../busschedules/dto/create-busschedule.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
      : ['http://localhost:3000'],
    credentials: true,
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients = new Map<string, Socket>();

  constructor(
    private readonly usersService: UsersService,
    private readonly busScheduleService: BusschedulesService,
  ) {}

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  handleConnection(socket: Socket) {
    const clientId = this.generateId();
    socket.data.clientId = clientId;
    this.clients.set(clientId, socket);
    console.log(`Клиент ${clientId} подключился (socket.id=${socket.id})`);
    socket.emit('init', { type: 'init', clientId });
    this.broadcastClientList();
  }

  handleDisconnect(socket: Socket) {
    const clientId: string | undefined = socket.data?.clientId;
    if (clientId) {
      console.log(`Клиент ${clientId} отключился`);
      this.clients.delete(clientId);
      this.broadcastClientList();
    }
  }

  @SubscribeMessage('setBlock')
  async handleSetBlock(
    @MessageBody() data: { userId: number; is_blocked: boolean },
    //@ConnectedSocket() _socket: Socket,
  ) {
    const { userId, is_blocked } = data;
    await this.usersService.update(userId, { is_blocked });
    if (is_blocked) this.server.emit('blocked', userId);
    return { success: true };
  }

  @SubscribeMessage('newBusSchedule')
  async handleNewBusSchedule(
    @MessageBody() newBusSchedule: CreateBusscheduleDto,
  ) {
    await this.busScheduleService.create(newBusSchedule);
    this.server.emit('update');
  }

  @SubscribeMessage('updateBusSchedule')
  async handleUpdateBusSchedule(@MessageBody() data: UpdateBusscheduleDto) {
    await this.busScheduleService.update(data.id as number, data);
    this.server.emit('update');
  }

  //   @SubscribeMessage('deleteBusSchedule')
  //   async handleDeleteBusSchedule(@MessageBody() id: number) {
  //     await this.busScheduleService.delete(id);
  //     this.server.emit('update');
  //   }

  @SubscribeMessage('deleteBusSchedule')
  async handleDeleteBusSchedule(@MessageBody() id: number) {
    await this.busScheduleService.remove(id);
    this.server.emit('update');
  }

  @SubscribeMessage('whoami')
  handleWhoami(@ConnectedSocket() socket: Socket) {
    socket.emit('init', { type: 'init', clientId: socket.data?.clientId });
    const clientIds = Array.from(this.clients.keys());
    socket.emit('clients', {
      type: 'clients',
      clients: clientIds,
      count: clientIds.length,
    });
  }

  @SubscribeMessage('offer')
  handleOffer(@MessageBody() payload: any, @ConnectedSocket() socket: Socket) {
    this.handleSignaling(socket, socket.data?.clientId, {
      type: 'offer',
      ...payload,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() payload: any, @ConnectedSocket() socket: Socket) {
    this.handleSignaling(socket, socket.data?.clientId, {
      type: 'answer',
      ...payload,
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody() payload: any,
    @ConnectedSocket() socket: Socket,
  ) {
    this.handleSignaling(socket, socket.data?.clientId, {
      type: 'ice-candidate',
      ...payload,
    });
  }

  @SubscribeMessage('broadcast-offer')
  handleBroadcastOffer(
    @MessageBody() payload: any,
    @ConnectedSocket() socket: Socket,
  ) {
    this.handleSignaling(socket, socket.data?.clientId, {
      type: 'broadcast-offer',
      ...payload,
    });
  }

  private handleSignaling(_senderSocket: Socket, senderId: string, data: any) {
    try {
      console.log(
        `[Signaling] ${data.type} from ${senderId} to ${data.target || 'BROADCAST'}`,
      );
      switch (data.type) {
        case 'offer':
        case 'answer':
        case 'ice-candidate': {
          const target = this.clients.get(data.target);
          if (target?.connected) {
            target.emit(data.type, { ...data, from: senderId });
          }
          break;
        }
        case 'broadcast-offer': {
          this.clients.forEach((client, id) => {
            if (id !== senderId && client.connected) {
              client.emit('offer', {
                type: 'offer',
                from: senderId,
                offer: data.offer,
              });
            }
          });
          break;
        }
        default:
          console.warn('Unknown signaling type:', data.type);
      }
    } catch (e) {
      console.error('Ошибка signaling:', e);
    }
  }

  private broadcastClientList() {
    const clientIds = Array.from(this.clients.keys());
    this.server.emit('clients', {
      type: 'clients',
      clients: clientIds,
      count: clientIds.length,
    });
  }
}

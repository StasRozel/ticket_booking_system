import express from 'express';
import { useExpressServer } from 'routing-controllers';
import request from 'supertest';
import { TicketController } from './controller';
import * as ticketRepo from '../repository/repository';

jest.mock('../repository/repository');

describe('TicketController', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    useExpressServer(app, {
      controllers: [TicketController],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /tickets/ должен возвращать все билеты', async () => {
    const tickets = [{ id: 1, booking_id: 1 }, { id: 2, booking_id: 2 }];
    (ticketRepo.ticketRepository.findAll as jest.Mock).mockResolvedValue(tickets);
    const res = await request(app).get('/tickets/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(tickets);
    expect(ticketRepo.ticketRepository.findAll).toHaveBeenCalled();
  });

  it('GET /tickets/:booking_id должен возвращать билет по booking_id', async () => {
    const ticket = { id: 1, booking_id: 1 };
    (ticketRepo.ticketRepository.findByBookingId as jest.Mock).mockResolvedValue(ticket);
    const res = await request(app).get('/tickets/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(ticket);
    expect(ticketRepo.ticketRepository.findByBookingId).toHaveBeenCalledWith(1);
  });

  it('POST /tickets/create/ должен создавать билет', async () => {
    const newTicket = { booking_id: 1 };
    const createdTicket = { ...newTicket, id: 1 };
    (ticketRepo.ticketRepository.create as jest.Mock).mockResolvedValue(createdTicket);
    const res = await request(app).post('/tickets/create/').send(newTicket);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(createdTicket);
    expect(ticketRepo.ticketRepository.create).toHaveBeenCalledWith(newTicket);
  });

  it('POST /tickets/create/ должен создавать несколько билетов', async () => {
    const ticketsToCreate = [
      { booking_id: 1, seat_number: 5, is_child: false, price: 100 },
      { booking_id: 2, seat_number: 3, is_child: true, price: 50 },
    ];
    const createdTickets = ticketsToCreate.map((t, i) => ({ ...t, id: i + 1 }));
    (ticketRepo.ticketRepository.create as jest.Mock)
      .mockResolvedValueOnce(createdTickets[0])
      .mockResolvedValueOnce(createdTickets[1]);

    for (let i = 0; i < ticketsToCreate.length; i++) {
      const res = await request(app).post('/tickets/create/').send(ticketsToCreate[i]);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(createdTickets[i]);
      expect(ticketRepo.ticketRepository.create).toHaveBeenCalledWith(ticketsToCreate[i]);
    }
  });

  it('PATCH /tickets/update/:id должен обновлять билет', async () => {
    const updatedTicket = { id: 1, booking_id: 1 };
    (ticketRepo.ticketRepository.update as jest.Mock).mockResolvedValue(updatedTicket);
    const res = await request(app).patch('/tickets/update/1').send(updatedTicket);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedTicket);
    expect(ticketRepo.ticketRepository.update).toHaveBeenCalledWith(1, updatedTicket);
  });

  it('PATCH /tickets/cansel/:id должен отменять билет', async () => {
    const canceledTicket = { id: 1, booking_id: 1, canceled: true };
    (ticketRepo.ticketRepository.cansel as jest.Mock).mockResolvedValue(canceledTicket);
    const res = await request(app).patch('/tickets/cansel/1').send(canceledTicket);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(canceledTicket);
    expect(ticketRepo.ticketRepository.cansel).toHaveBeenCalledWith(1, canceledTicket);
  });

  it('DELETE /tickets/delete/:id должен удалять билет', async () => {
    (ticketRepo.ticketRepository.delete as jest.Mock).mockResolvedValue(true);
    const res = await request(app).delete('/tickets/delete/1');
    expect(res.status).toBe(200);
    expect(res.body).toBe(true);
    expect(ticketRepo.ticketRepository.delete).toHaveBeenCalledWith(1);
  });

}); 
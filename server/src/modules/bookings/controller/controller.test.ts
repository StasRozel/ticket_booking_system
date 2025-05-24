import express from 'express';
import { useExpressServer } from 'routing-controllers';
import request from 'supertest';
import { BookingController } from './controller';
import * as bookingRepo from '../repository/repository';

jest.mock('../repository/repository');

describe('BookingController', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    useExpressServer(app, {
      controllers: [BookingController],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /booking/ должен возвращать все бронирования', async () => {
    const bookings = [{ id: 1, user_id: 1 }, { id: 2, user_id: 2 }];
    (bookingRepo.bookingRepository.findAll as jest.Mock).mockResolvedValue(bookings);
    const res = await request(app).get('/booking/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(bookings);
    expect(bookingRepo.bookingRepository.findAll).toHaveBeenCalled();
  });

  it('GET /booking/:user_id должен возвращать бронирования пользователя', async () => {
    const bookings = [{ id: 1, user_id: 1 }];
    (bookingRepo.bookingRepository.findAllByUserId as jest.Mock).mockResolvedValue(bookings);
    const res = await request(app).get('/booking/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(bookings);
    expect(bookingRepo.bookingRepository.findAllByUserId).toHaveBeenCalledWith(1);
  });

  it('POST /booking/create/ должен создавать бронирование', async () => {
    const newBooking = { user_id: 1 };
    const createdBooking = { ...newBooking, id: 1 };
    (bookingRepo.bookingRepository.create as jest.Mock).mockResolvedValue(createdBooking);
    const res = await request(app).post('/booking/create/').send(newBooking);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(createdBooking);
    expect(bookingRepo.bookingRepository.create).toHaveBeenCalledWith(newBooking);
  });

  it('PATCH /booking/update/:id должен обновлять бронирование', async () => {
    const updatedBooking = { id: 1, user_id: 1 };
    (bookingRepo.bookingRepository.update as jest.Mock).mockResolvedValue(updatedBooking);
    const res = await request(app).patch('/booking/update/1').send(updatedBooking);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedBooking);
    expect(bookingRepo.bookingRepository.update).toHaveBeenCalledWith(1, updatedBooking);
  });

  it('PATCH /booking/cansel/:id должен отменять бронирование', async () => {
    const canceledBooking = { id: 1, user_id: 1, canceled: true };
    (bookingRepo.bookingRepository.cansel as jest.Mock).mockResolvedValue(canceledBooking);
    const res = await request(app).patch('/booking/cansel/1').send(canceledBooking);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(canceledBooking);
    expect(bookingRepo.bookingRepository.cansel).toHaveBeenCalledWith(1, canceledBooking);
  });

  it('DELETE /booking/delete/:id должен удалять бронирование', async () => {
    (bookingRepo.bookingRepository.delete as jest.Mock).mockResolvedValue(true);
    const res = await request(app).delete('/booking/delete/1');
    expect(res.status).toBe(200);
    expect(res.body).toBe(true);
    expect(bookingRepo.bookingRepository.delete).toHaveBeenCalledWith(1);
  });
}); 
import express from 'express';
import { useExpressServer } from 'routing-controllers';
import request from 'supertest';
import { BusController } from './controller';
import * as busRepo from '../repository/repository';

jest.mock('../repository/repository');

describe('BusController', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    useExpressServer(app, {
      controllers: [BusController],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /buses/ должен возвращать все автобусы', async () => {
    const buses = [{ id: 1, name: 'Bus1' }, { id: 2, name: 'Bus2' }];
    (busRepo.busRepository.findAll as jest.Mock).mockResolvedValue(buses);
    const res = await request(app).get('/buses/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(buses);
    expect(busRepo.busRepository.findAll).toHaveBeenCalled();
  });

  it('GET /buses/:id должен возвращать автобус по id', async () => {
    const bus = { id: 1, name: 'Bus1' };
    (busRepo.busRepository.findOneById as jest.Mock).mockResolvedValue(bus);
    const res = await request(app).get('/buses/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(bus);
    expect(busRepo.busRepository.findOneById).toHaveBeenCalledWith(1);
  });

  it('POST /buses/create/ должен создавать автобус', async () => {
    const newBus = { name: 'Bus1' };
    const createdBus = { ...newBus, id: 1 };
    (busRepo.busRepository.create as jest.Mock).mockResolvedValue(createdBus);
    const res = await request(app).post('/buses/create/').send(newBus);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(createdBus);
    expect(busRepo.busRepository.create).toHaveBeenCalledWith(newBus);
  });

  it('PATCH /buses/update/:id должен обновлять автобус', async () => {
    const updatedBus = { id: 1, name: 'UpdatedBus' };
    (busRepo.busRepository.update as jest.Mock).mockResolvedValue(updatedBus);
    const res = await request(app).patch('/buses/update/1').send(updatedBus);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedBus);
    expect(busRepo.busRepository.update).toHaveBeenCalledWith(1, updatedBus);
  });

  it('DELETE /buses/delete/:id должен удалять автобус', async () => {
    (busRepo.busRepository.delete as jest.Mock).mockResolvedValue(true);
    const res = await request(app).delete('/buses/delete/1');
    expect(res.status).toBe(200);
    expect(res.body).toBe(true);
    expect(busRepo.busRepository.delete).toHaveBeenCalledWith(1);
  });
}); 
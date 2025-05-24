import express from 'express';
import { useExpressServer } from 'routing-controllers';
import request from 'supertest';
import { BusScheduleController } from './controller';
import * as busScheduleRepo from '../repository/repository';

jest.mock('../repository/repository');

describe('BusScheduleController', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    useExpressServer(app, {
      controllers: [BusScheduleController],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /bus-schedules/ должен возвращать все расписания автобусов', async () => {
    const schedules = [{ id: 1, name: 'Schedule1' }, { id: 2, name: 'Schedule2' }];
    (busScheduleRepo.busScheduleRepository.findAll as jest.Mock).mockResolvedValue(schedules);
    const res = await request(app).get('/bus-schedules/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(schedules);
    expect(busScheduleRepo.busScheduleRepository.findAll).toHaveBeenCalled();
  });

  it('GET /bus-schedules/:id должен возвращать расписание по id', async () => {
    const schedule = { id: 1, name: 'Schedule1' };
    (busScheduleRepo.busScheduleRepository.findOneById as jest.Mock).mockResolvedValue(schedule);
    const res = await request(app).get('/bus-schedules/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(schedule);
    expect(busScheduleRepo.busScheduleRepository.findOneById).toHaveBeenCalledWith(1);
  });

  it('POST /bus-schedules/create/ должен создавать расписание', async () => {
    const newSchedule = { name: 'Schedule1' };
    const createdSchedule = { ...newSchedule, id: 1 };
    (busScheduleRepo.busScheduleRepository.create as jest.Mock).mockResolvedValue(createdSchedule);
    const res = await request(app).post('/bus-schedules/create/').send(newSchedule);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(createdSchedule);
    expect(busScheduleRepo.busScheduleRepository.create).toHaveBeenCalledWith(newSchedule);
  });

  it('PATCH /bus-schedules/update/:id должен обновлять расписание', async () => {
    const updatedSchedule = { id: 1, name: 'UpdatedSchedule' };
    (busScheduleRepo.busScheduleRepository.update as jest.Mock).mockResolvedValue(updatedSchedule);
    const res = await request(app).patch('/bus-schedules/update/1').send(updatedSchedule);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedSchedule);
    expect(busScheduleRepo.busScheduleRepository.update).toHaveBeenCalledWith(1, updatedSchedule);
  });

  it('DELETE /bus-schedules/delete/:id должен удалять расписание', async () => {
    (busScheduleRepo.busScheduleRepository.delete as jest.Mock).mockResolvedValue(true);
    const res = await request(app).delete('/bus-schedules/delete/1');
    expect(res.status).toBe(200);
    expect(res.body).toBe(true);
    expect(busScheduleRepo.busScheduleRepository.delete).toHaveBeenCalledWith(1);
  });
}); 
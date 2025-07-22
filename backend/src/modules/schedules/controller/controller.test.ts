import express from 'express';
import { useExpressServer } from 'routing-controllers';
import request from 'supertest';
import { ScheduleController } from './controller';
import * as scheduleRepo from '../repository/repository';

jest.mock('../repository/repository');

describe('ScheduleController', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    useExpressServer(app, {
      controllers: [ScheduleController],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /schedules/ должен возвращать все расписания', async () => {
    const schedules = [{ id: 1, name: 'Schedule1' }, { id: 2, name: 'Schedule2' }];
    (scheduleRepo.scheduleRepository.findAll as jest.Mock).mockResolvedValue(schedules);
    const res = await request(app).get('/schedules/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(schedules);
    expect(scheduleRepo.scheduleRepository.findAll).toHaveBeenCalled();
  });

  it('GET /schedules/:id должен возвращать расписание по id', async () => {
    const schedule = { id: 1, name: 'Schedule1' };
    (scheduleRepo.scheduleRepository.findOneById as jest.Mock).mockResolvedValue(schedule);
    const res = await request(app).get('/schedules/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(schedule);
    expect(scheduleRepo.scheduleRepository.findOneById).toHaveBeenCalledWith(1);
  });

  it('POST /schedules/create/ должен создавать расписание', async () => {
    const newSchedule = { name: 'Schedule1' };
    const createdSchedule = { ...newSchedule, id: 1 };
    (scheduleRepo.scheduleRepository.create as jest.Mock).mockResolvedValue(createdSchedule);
    const res = await request(app).post('/schedules/create/').send(newSchedule);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(createdSchedule);
    expect(scheduleRepo.scheduleRepository.create).toHaveBeenCalledWith(newSchedule);
  });

  it('PATCH /schedules/update/:id должен обновлять расписание', async () => {
    const updatedSchedule = { id: 1, name: 'UpdatedSchedule' };
    (scheduleRepo.scheduleRepository.update as jest.Mock).mockResolvedValue(updatedSchedule);
    const res = await request(app).patch('/schedules/update/1').send(updatedSchedule);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedSchedule);
    expect(scheduleRepo.scheduleRepository.update).toHaveBeenCalledWith(1, updatedSchedule);
  });

  it('DELETE /schedules/delete/:id должен удалять расписание', async () => {
    (scheduleRepo.scheduleRepository.delete as jest.Mock).mockResolvedValue(true);
    const res = await request(app).delete('/schedules/delete/1');
    expect(res.status).toBe(200);
    expect(res.body).toBe(true);
    expect(scheduleRepo.scheduleRepository.delete).toHaveBeenCalledWith(1);
  });
}); 
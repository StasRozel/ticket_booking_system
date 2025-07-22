import express from 'express';
import { useExpressServer } from 'routing-controllers';
import request from 'supertest';
import { RouteController } from './controller';
import * as routeRepo from '../repository/repository';

jest.mock('../repository/repository');

describe('RouteController', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    useExpressServer(app, {
      controllers: [RouteController],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /routes/ должен возвращать все маршруты', async () => {
    const routes = [
      { id: 1, name: 'A', starting_point: 'B', ending_point: 'C', stops: '', distance: 10, price: 100 },
      { id: 2, name: 'D', starting_point: 'E', ending_point: 'F', stops: '', distance: 20, price: 200 }
    ];
    (routeRepo.routeRepository.findAll as jest.Mock).mockResolvedValue(routes);
    const res = await request(app).get('/routes/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(routes);
    expect(routeRepo.routeRepository.findAll).toHaveBeenCalled();
  });

  it('GET /routes/:id должен возвращать маршрут по id', async () => {
    const route = { id: 1, name: 'A', starting_point: 'B', ending_point: 'C', stops: '', distance: 10, price: 100 };
    (routeRepo.routeRepository.findOneById as jest.Mock).mockResolvedValue(route);
    const res = await request(app).get('/routes/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(route);
    expect(routeRepo.routeRepository.findOneById).toHaveBeenCalledWith(1);
  });

  // it('GET /price/:id должен возвращать цену маршрута', async () => {
  //   (routeRepo.routeRepository.findPriceById as jest.Mock).mockResolvedValue(150);
  //   const res = await request(app).get('/price/1');
  //   expect(res.status).toBe(200);
  //   expect(Number(res.body)).toBe(150);
  //   expect(routeRepo.routeRepository.findPriceById).toHaveBeenCalledWith(1);
  // });

  it('POST /routes/create/ должен создавать маршрут', async () => {
    const newRoute = { name: 'A', starting_point: 'B', ending_point: 'C', stops: '', distance: 10, price: 100 };
    const createdRoute = { ...newRoute, id: 1 };
    (routeRepo.routeRepository.create as jest.Mock).mockResolvedValue(createdRoute);
    const res = await request(app).post('/routes/create/').send(newRoute);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(createdRoute);
    expect(routeRepo.routeRepository.create).toHaveBeenCalledWith(newRoute);
  });

  it('PATCH /routes/update/:id должен обновлять маршрут', async () => {
    const updatedRoute = { id: 1, name: 'Updated', starting_point: 'B', ending_point: 'C', stops: '', distance: 10, price: 100 };
    (routeRepo.routeRepository.update as jest.Mock).mockResolvedValue(updatedRoute);
    const res = await request(app).patch('/routes/update/1').send(updatedRoute);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedRoute);
    expect(routeRepo.routeRepository.update).toHaveBeenCalledWith(1, updatedRoute);
  });

  it('DELETE /routes/delete/:id должен удалять маршрут', async () => {
    (routeRepo.routeRepository.delete as jest.Mock).mockResolvedValue(true);
    const res = await request(app).delete('/routes/delete/1');
    expect(res.status).toBe(200);
    expect(res.body).toBe(true);
    expect(routeRepo.routeRepository.delete).toHaveBeenCalledWith(1);
  });
}); 
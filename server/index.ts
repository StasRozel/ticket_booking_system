import express from 'express';
import { useExpressServer } from 'routing-controllers';
import { AppDataSource } from './src/config/db.spec';
import bodyParser from 'body-parser';
import cors from 'cors'
import http from 'http';
import { RouteController } from './src/modules/routes/controller/controller';
import { ScheduleController } from './src/modules/schedules/controller/controller';
import { AuthController } from './src/modules/auth/conroller/authController';
import { authMiddleware } from './src/shared/middlewares/auth';
import { BusController } from './src/modules/buses/controller/controller';
import { BusScheduleController } from './src/modules/busschedules/controller/controller';
import { UserController } from './src/modules/auth/conroller/userController';
import { Server, Socket } from 'socket.io';

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(cors());

useExpressServer(app, {
  controllers: [RouteController, ScheduleController, AuthController, BusController, BusScheduleController, UserController],
  authorizationChecker: async (action) => {
    const token = action.request.headers.authorization?.split(' ')[1];
    if (!token) return false;

    try {
      await authMiddleware(action.request, action.response, () => { });
      return true;
    } catch (error) {
      return false;
    }
  },
});

export const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

AppDataSource.initialize()
  .then(() => {
    console.log("\x1b[32m", "Database initialise successfully")
  })
  .catch((error) => console.log(error))

app.listen(3001, () => {
  console.log("\x1b[32m", "Server running in http://localhost:3001");
});

import './src/shared/socketHandlers';

const PORT: number = 4029;
server.listen(4029, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

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
import { BookingController } from './src/modules/bookings/controller/controller';
import { TicketController } from './src/modules/tickets/controller/controller';
import { Server } from 'socket.io';
require('dotenv');

const app = express();
const server = http.createServer(app);

const HTTP_PORT = process.env.HTTP_PORT;
const SOCK_PORT = process.env.SOCK_PORT;

app.use(bodyParser.json());
app.use(cors());

useExpressServer(app, {
  controllers: [RouteController, ScheduleController, AuthController, 
                BusController, BusScheduleController, UserController, 
               BookingController, TicketController],
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

app.listen(HTTP_PORT, () => {
  console.log("\x1b[32m", `Server running on http://localhost:${HTTP_PORT}`);
});

import './src/shared/socketHandlers';

server.listen(SOCK_PORT, () => {
  console.log(`\x1b[32m`, `Sockets running on  port ${SOCK_PORT}`);
});

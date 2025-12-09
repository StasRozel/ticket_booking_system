import express from "express";
import { useExpressServer } from "routing-controllers";
import { AppDataSource } from "./src/config/db.config";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import https from "https";
import { RouteController } from "./src/modules/routes/controller/controller";
import { ScheduleController } from "./src/modules/schedules/controller/controller";
import { AuthController } from "./src/modules/auth/conroller/authController";
import { authMiddleware } from "./src/shared/middlewares/auth";
import { BusController } from "./src/modules/buses/controller/controller";
import { BusScheduleController } from "./src/modules/busschedules/controller/controller";
import { UserController } from "./src/modules/auth/conroller/userController";
import { BookingController } from "./src/modules/bookings/controller/controller";
import { TicketController } from "./src/modules/tickets/controller/controller";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
// Load environment variables as early as possible
import dotenv from "dotenv";
dotenv.config();

// Backwards-compat: if project used single JWT_SECRET, map it to ACCESS/REFRESH
// if (!process.env.ACCESS_TOKEN_SECRET && process.env.JWT_SECRET) {
//   process.env.ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
// }
// if (!process.env.REFRESH_TOKEN_SECRET && process.env.JWT_SECRET) {
//   process.env.REFRESH_TOKEN_SECRET = process.env.JWT_SECRET;
// }

// // Validate required secrets early and give a helpful error
// if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
//   console.error('\x1b[31m', 'FATAL: Missing JWT secrets. Set ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET environment variables.');
//   // Do not exit automatically in development here, but it's helpful to know.
//}

const app = express();
const serverHttp = http.createServer(app);

const HTTP_PORT = process.env.HTTP_PORT;
const SOCK_PORT = process.env.SOCK_PORT;

const certPath = path.join(__dirname, "cert.pem");
const keyPath = path.join(__dirname, "key.pem");

const options = {
  cert: fs.readFileSync(certPath),
  key: fs.readFileSync(keyPath),
};
const serverHttps = https.createServer(options, app);

app.use(bodyParser.json());
app.use(cors());

useExpressServer(app, {
  controllers: [
    RouteController,
    ScheduleController,
    AuthController,
    BusController,
    BusScheduleController,
    UserController,
    BookingController,
    TicketController,
  ],
  authorizationChecker: async (action) => {
    const openPaths = ["/auth/refresh/", "/auth/login/", "/auth/register/"];
    if (openPaths.some((path) => action.request.path.startsWith(path))) {
      return true;
    }

    const token = action.request.headers.authorization?.split(" ")[1];
    if (!token) return false;

    try {
      await authMiddleware(action.request, action.response, () => {});
      return true;
    } catch (error) {
      return false;
    }
  },
});

export const io = new Server(serverHttps, {
  cors: {
    origin: "*",
  },
});

AppDataSource.initialize()
  .then(() => {
    console.log("\x1b[32m", "Database initialize successfully");
  })
  .catch((error) => console.log(error));

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  serverHttps.listen(3443, () => {
    console.log("HTTPS server running at https://localhost:3443");
  });
  console.log("Используется HTTPS сервер");
} else {
  app.listen(HTTP_PORT, () => {
    console.log("\x1b[32m", `Server running on http://localhost:${HTTP_PORT}`);
  });
  console.log(
    "Используется HTTP сервер (для доступа к микрофону на других устройствах нужен HTTPS)"
  );
  console.log("Создайте сертификаты командой: npm run generate-cert");
}

import "./src/shared/socketHandlers";

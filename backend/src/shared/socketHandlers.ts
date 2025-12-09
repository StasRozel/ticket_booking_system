import { io } from "../..";
import { userRepository } from "../modules/auth/repository/repository";
import { busScheduleRepository } from "../modules/busschedules/repository/repository";
import { generateId } from "./generateId";
import type { Socket } from "socket.io";

const clients = new Map<string, Socket>();

io.on("connection", (socket: Socket) => {
  console.log("Socket.IO client connected:", socket.id);

  // Обработка получения сообщения (Socket.IO style events)
  socket.on("setBlock", async ({ userId, is_blocked }, callback) => {
    console.log("setBlock", userId);
    await userRepository.update(userId, { is_blocked });
    if (is_blocked) io.emit("blocked", userId);
    if (typeof callback === "function") callback({ success: true });
  });

  socket.on("newBusSchedule", async (newBusSchedule) => {
    await busScheduleRepository.create(newBusSchedule);
    io.emit("update");
  });

  socket.on("updateBusSchedule", async (id, newBusSchedule) => {
    await busScheduleRepository.update(id, newBusSchedule);
    io.emit("update");
  });

  socket.on("deleteBusSchedule", async (id) => {
    await busScheduleRepository.delete(id);
    io.emit("update");
  });

  // Создаем и сохраняем clientId (логика вашего приложения)
  const clientId = generateId();
  // Сохраняем clientId в данных сокета для удобства
  (socket as any).data = (socket as any).data || {};
  (socket as any).data.clientId = clientId;

  clients.set(clientId, socket);

  console.log(`Клиент ${clientId} подключился (socket.id=${socket.id})`);

  // Отправляем клиенту его ID
  socket.emit("init", { type: "init", clientId });

  // Отправляем список всех клиентов (всем)
  broadcastClientList();

  socket.on("whoami", () => {
    socket.emit("init", { type: "init", clientId });
  });

  // Поддержка старого "message" если клиент шлёт JSON-строки (backwards compat)
  socket.on("message", (message: any) => {
    // Если клиент посылает строку — попробуем распарсить и обработать как signaling
    try {
      const data = typeof message === "string" ? JSON.parse(message) : message;
      handleSignaling(socket, clientId, data);
    } catch (e) {
      console.error("Ошибка обработки text message:", e);
    }
  });

  // Новые явные события сигналинга
  socket.on("offer", (payload) => handleSignaling(socket, clientId, { type: "offer", ...payload }));
  socket.on("answer", (payload) => handleSignaling(socket, clientId, { type: "answer", ...payload }));
  socket.on("ice-candidate", (payload) => handleSignaling(socket, clientId, { type: "ice-candidate", ...payload }));
  socket.on("broadcast-offer", (payload) => handleSignaling(socket, clientId, { type: "broadcast-offer", ...payload }));

  // Отключение
  socket.on("disconnect", (reason) => {
    console.log(`Клиент ${clientId} отключился (reason=${reason})`);
    clients.delete(clientId);
    broadcastClientList();
  });

  socket.on("error", (error) => {
    console.error("Socket.IO error:", error);
    clients.delete(clientId);
    broadcastClientList();
  });
});

function handleSignaling(senderSocket: Socket, senderId: string, data: any) {
  try {
    console.log(`[Signaling] ${data.type} from ${senderId} to ${data.target || "BROADCAST"}`);
    switch (data.type) {
      case "offer":
      case "answer":
      case "ice-candidate": {
        const targetSocket = clients.get(data.target);
        if (targetSocket && targetSocket.connected) {
          // Отправляем событие напрямую целевому клиенту
          // В Socket.IO лучше посылать структурированные события, но оставим payload
          targetSocket.emit(data.type, { ...data, from: senderId });
          console.log(`[Signaling] Relayed ${data.type} to ${data.target}`);
        } else {
          console.log(`[Signaling] Target ${data.target} not connected or not found`);
        }
        break;
      }

      case "broadcast-offer": {
        // Отправляем offer всем клиентам, кроме отправителя
        clients.forEach((client, id) => {
          if (id !== senderId && client.connected) {
            client.emit("offer", { type: "offer", from: senderId, offer: data.offer });
          }
        });
        console.log(`[Signaling] Broadcasted offer from ${senderId}`);
        break;
      }

      default:
        console.warn("Unknown signaling message type:", data.type);
    }
  } catch (e) {
    console.error("Ошибка обработки signaling сообщения:", e);
  }
}

function broadcastClientList() {
  const clientIds = Array.from(clients.keys());
  console.log("Broadcasting client list:", clientIds);

  // Отправляем общий event с списком всем клиентам через io.emit
  io.emit("clients", { type: "clients", clients: clientIds, count: clientIds.length });

  // Дополнительно логируем состояние каждого сокета
  clients.forEach((client, id) => {
    const connected = !!(client && (client.connected === true));
    if (connected) {
      console.log(`Sending list to ${id} (socket.id=${client.id})`);
    } else {
      console.log(`Client ${id} is not connected (connected: ${connected})`);
    }
  });
}

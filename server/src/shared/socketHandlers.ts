import { io } from "../..";
import { userRepository } from "../modules/auth/repository/repository";

io.on('connection', (socket) => {
    console.log('Пользователь подключился:', socket.id);

    // Обработка получения сообщения
    socket.on('setBlock', async ({userId, is_blocked}) => {
        // Рассылка сообщения всем подключенным клиентам
        console.log('setBlock', userId);
        await userRepository.update(userId, {is_blocked});
        console.log('setblock33');
        if (is_blocked) io.emit('blocked', userId);
        console.log('setblock44');
    });

    // Обработка отключения
    socket.on('disconnect', () => {
        console.log('Пользователь отключился:', socket.id);
    });
});
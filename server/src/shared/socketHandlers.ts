import { io } from "../..";
import { userRepository } from "../modules/auth/repository/repository";
import { busScheduleRepository } from "../modules/busschedules/repository/repository";

io.on('connection', (socket) => {
    console.log('Пользователь подключился:', socket.id);

    // Обработка получения сообщения
    socket.on('setBlock', async ({userId, is_blocked}) => {
        // Рассылка сообщения всем подключенным клиентам
        console.log('setBlock', userId);
        await userRepository.update(userId, {is_blocked});
        if (is_blocked) io.emit('blocked', userId);
    });

    socket.on('newBusSchedule', async( newBusSchedule ) => {
        await busScheduleRepository.create(newBusSchedule);
        io.emit('update');
    })

    socket.on('updateBusSchedule', async( id, newBusSchedule ) => {
        await busScheduleRepository.update(id, newBusSchedule);
        io.emit('update');
    })

    socket.on('deleteBusSchedule', async( id ) => {
        await busScheduleRepository.delete(id);
        io.emit('update');
    })

    // Обработка отключения
    socket.on('disconnect', () => {
        console.log('Пользователь отключился:', socket.id);
    });
});
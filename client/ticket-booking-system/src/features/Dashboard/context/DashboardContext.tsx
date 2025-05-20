import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { socket } from '../../..';
import { BusScheduleType } from '../../../shared/types/BusScheduleType';
import { BusType } from '../../../shared/types/BusType';
import { DashboardContextType } from '../../../shared/types/DashboardContextType';
import { RouteType } from '../../../shared/types/RouteType';
import { ScheduleType } from '../../../shared/types/ScheduleType';
import { UserType } from '../../../shared/types/UserType';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const [trigger, setTrigger] = useState(0);
    const [schedules, setSchedules] = useState([]);
    const [busSchedules, setBusSchedules] = useState([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [isModalFormOpen, setIsModalFormOpen] = useState(false);
    const [isAddMode, setIsAddMode] = useState(true);
    const [currentEntity, setCurrentEntity] = useState(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const api = axios.create({
        baseURL: 'http://localhost:3001/',
    });

    const NewRoute = async (newRoute: RouteType): Promise<void> => {
        await api.post('/routes/create/', newRoute);
        setTrigger(next => ++next);
    };

    const UpdateRoute = async (id: number, updRoute: RouteType): Promise<void> => {
        await api.patch(`/routes/update/${id}`, updRoute);
        setTrigger(next => ++next);
    };

    const fetchRoutes = async () => {
        try {
            const response = await api.get('/routes/');
            setRoutes(response.data);
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    };

    const DeleteRoute = async (id: number) => {
        await api.delete(`/routes/delete/${id}`);
        setTrigger(next => ++next);
        console.log(`Deleting route ${trigger}`);
    };

    const fetchSchedules = async () => {
        try {
            const response = await api.get('/schedules/');
            setSchedules(response.data);
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    };

    const NewSchedule = async (newSchedule: any): Promise<void> => {
        await api.post('/schedules/create/', newSchedule);
        setTrigger(next => ++next);
    };

    const UpdateSchedule = async (id: number, updSchedule: ScheduleType): Promise<void> => {
        await api.patch(`/schedules/update/${id}`, updSchedule);
        setTrigger(next => ++next);
    };

    const DeleteSchedule = async (id: number) => {
        await api.delete(`/schedules/delete/${id}`);
        setTrigger(next => ++next);
        console.log(`Deleting route ${trigger}`);
    };

    const fetchBuses = async () => {
        try {
            const response = await api.get('/buses/');
            setBuses(response.data);
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    };

    const NewBus = async (newSchedule: any): Promise<void> => {
        await api.post('/buses/create/', newSchedule);
        setTrigger(next => ++next);
    };

    const UpdateBus = async (id: number, updSchedule: BusType): Promise<void> => {
        await api.patch(`/buses/update/${id}`, updSchedule);
        setTrigger(next => ++next);
    };

    const DeleteBus = async (id: number) => {
        await api.delete(`/buses/delete/${id}`);
        setTrigger(next => ++next);
        console.log(`Deleting route ${trigger}`);
    };

    const fetchBusSchedules = async () => {
        try {
            const response = await api.get('/bus-schedules/');
            setBusSchedules(response.data);
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    };

    const NewBusSchedule = async (newBusSchedule: BusScheduleType): Promise<void> => {
        //await api.post('/bus-schedules/create/', newSchedule);
        socket.emit('newBusSchedule', newBusSchedule);
        setTrigger(next => ++next);
    };

    const UpdateBusSchedule = async (id: number, updSchedule: BusScheduleType): Promise<void> => {
        //await api.patch(`/bus-schedules/update/${id}`, updSchedule);
        socket.emit('updateBusSchedule', id, updSchedule);
        setTrigger(next => ++next);
    };

    const DeleteBusSchedule = async (id: number) => {
        //await api.delete(`/bus-schedules/delete/${id}`);
        socket.emit('deleteBusSchedule', id);
        setTrigger(next => ++next);
        console.log(`Deleting route ${trigger}`);
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/users/');
            setUsers(response.data);
        } catch (err) {
            console.error('Ошибка при загрузке пользователей:', err);
            setError('Не удалось загрузить список пользователей. Попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserBlock = async (userId: number, blocked: boolean) => {
        try {
            socket.emit('setBlock', { userId, is_blocked: !blocked });

            setTrigger(next => ++next);
            console.log(`Пользователь ${userId} ${blocked ? 'разблокирован' : 'заблокирован'}`);
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, blocked: !blocked } : user
                )
            );
        } catch (err) {
            console.error('Ошибка при обновлении статуса пользователя:', err);
            setError('Не удалось обновить статус пользователя. Попробуйте снова.');
        }
    };

    const OpenModalForm = (flag: boolean, entity: any) => { setIsModalFormOpen(true); setIsAddMode(flag); setCurrentEntity(entity) }

    const CloseModalForm = () => {setIsModalFormOpen(false); };

    return (
        <DashboardContext.Provider value={{
            routes, trigger, NewRoute, UpdateRoute, fetchRoutes, DeleteRoute,
            schedules, fetchSchedules, NewSchedule, UpdateSchedule, DeleteSchedule,
            users, loading, error, fetchUsers, toggleUserBlock,
            buses, fetchBuses, NewBus, UpdateBus, DeleteBus,
            busSchedules, fetchBusSchedules, NewBusSchedule, UpdateBusSchedule, DeleteBusSchedule,
            currentEntity,
            isModalFormOpen, isAddMode, OpenModalForm, CloseModalForm
        }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within an DashboardProvider');
    }
    return context;
};
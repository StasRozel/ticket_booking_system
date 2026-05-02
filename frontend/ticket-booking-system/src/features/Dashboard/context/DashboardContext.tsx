import React, { createContext, useState, useContext, useCallback } from 'react';
import { socket } from '../../..';
import { BusScheduleType } from '../../../shared/types/BusScheduleType';
import { BusType } from '../../../shared/types/BusType';
import { DashboardContextType } from '../../../shared/types/DashboardContextType';
import { ScheduleType } from '../../../shared/types/ScheduleType';
import { UserType } from '../../../shared/types/UserType';
import api from '../../../shared/utils/api';
import { RouteType } from '../../../shared/types/RouteType';

type EntityType = RouteType | BusScheduleType | BusType | ScheduleType;

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const [trigger, setTrigger] = useState(0);
    const [schedules, setSchedules] = useState([]);
    const [busSchedules, setBusSchedules] = useState([]);
    const [urgentCalls, setUrgentCalls] = useState([]);
    const [driverComplaints, setDriverComplaints] = useState([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [isModalFormOpen, setIsModalFormOpen] = useState(false);
    const [isAddMode, setIsAddMode] = useState(true);
    const [currentEntity, setCurrentEntity] = useState(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createEntity = async (route: string, newEntity: EntityType): Promise<void> => {
        try {
            const response = await api.post(route, newEntity);
            if (response.data) {
                setTrigger(next => ++next);
            }
        } catch (error) {
            console.error('Error creating entity:', error);
            throw new Error('Failed to create entity');
        }
    } 

    const updateEntity = async (route: string, id: number, updateEntity: EntityType): Promise<void> => {
        try {
            const response = await api.patch(`${route}/${id}`, updateEntity);
            if (response.data) {
                setTrigger(next => ++next);
            }
        } catch (error: any) {
            console.error('Error creating entity:', error);
            throw new Error('Failed to create entity');
        }
    }

    const deleteEntity = async (route: string, id: number): Promise<void> => {
        await api.delete(`${route}/${id}`);
        //socket.emit('deleteBusSchedule', id);
        setTrigger(next => ++next);
        console.log(`Deleting route ${trigger}`);
    }

    const fetchRoutes = useCallback(async () => {
        try {
            const response = await api.get('/routes/');
            setRoutes(response.data);
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    }, []);

    const fetchSchedules = useCallback(async () => {
        try {
            const response = await api.get('/schedules/');
            setSchedules(response.data);
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    }, []);


    const fetchBuses = useCallback(async () => {
        try {
            const response = await api.get('/buses/');
            setBuses(response.data);
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    }, []);

    const fetchBusSchedules = useCallback(async () => {
        try {
            const response = await api.get('/bus-schedules/');
            setBusSchedules(response.data);
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    }, []);

    const fetchUrgentCalls = async () => {
        try {
            const response = await api.get('/urgentcalls/');
            setUrgentCalls(response.data);
        } catch (error) {
            console.error('Error fetching urgent calls:', error);
        }
    };

    const updateUrgentCalls = async (id: number) => {
        try {
            await api.patch(`/urgentcalls/${id}`, {accepted: true});
        } catch (error) {
            
        }
    }

    const fetchDriverComplaints = async () => {
        try {
            const response = await api.get('/complaints');
            setDriverComplaints(response.data);
        } catch (error) {
            console.error('Error fetching driver complaints:', error);
        }
    };

    const deleteDriverComplaint = async (id: number) => {
        try {
            await api.delete(`/complaints/${id}`);
            setTrigger(next => ++next);
        } catch (error) {
            console.error('Error deleting driver complaint:', error);
            throw error;
        }
    };

    const replaceBusScheduleDriverAndBus = async (busScheduleId: number, driverId: number, urgentCallId: number) => {
        try {
            // Backend does not expose a dedicated replace endpoint; update bus-schedule directly
            const response = await api.patch(`/bus-schedules/${busScheduleId}`, { driver_id: driverId, urgent_call_id: urgentCallId });
            if (response.data) setTrigger(next => ++next);

            updateUrgentCalls(urgentCallId);
            return response.data;
        } catch (error) {
            console.error('Error replacing driver/bus for bus schedule:', error);
            throw error;
        }
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
            setLoading(true);
            // Отправляем запрос на блокировку/разблокировку
            socket.emit('setBlock', { userId, is_blocked: !blocked }, (response: { success: boolean; error?: string }) => {
                if (response.success) {
                    // После успешного изменения статуса запрашиваем обновленный список пользователей
                    fetchUsers();
                    console.log(`Пользователь ${userId} ${blocked ? 'разблокирован' : 'заблокирован'}`);
                } else {
                    console.error('Ошибка сервера:', response.error);
                    setError('Не удалось обновить статус пользователя. Попробуйте снова.');
                    setLoading(false);
                }
            });
        } catch (err) {
            console.error('Ошибка при обновлении статуса пользователя:', err);
            setError('Не удалось обновить статус пользователя. Попробуйте снова.');
            setLoading(false);
        }
    };

    const OpenModalForm = (flag: boolean, entity: any) => { 
        console.log(entity);
        setIsModalFormOpen(true); 
        setIsAddMode(flag); 
        setCurrentEntity(entity); 
    }

    const CloseModalForm = () => {setIsModalFormOpen(false); };

    return (
        <DashboardContext.Provider value={{
            routes, trigger, createEntity, updateEntity, fetchRoutes, deleteEntity,
            schedules, fetchSchedules,
            users, loading, error, fetchUsers, toggleUserBlock,
            buses, fetchBuses,
            busSchedules, fetchBusSchedules,
            urgentCalls, fetchUrgentCalls, replaceBusScheduleDriverAndBus,
            driverComplaints, fetchDriverComplaints, deleteDriverComplaint,
            currentEntity,
            isModalFormOpen, isAddMode, OpenModalForm, CloseModalForm
        }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
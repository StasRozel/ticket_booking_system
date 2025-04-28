import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { BusScheduleType } from '../../../shared/types/BusScheduleType';
import { HomeContextType } from '../../../shared/types/HomeContextType';

const HomeContext = createContext<HomeContextType | undefined>(undefined);

const api = axios.create({
    baseURL: 'http://localhost:3001',
});

export const HomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [busSchedules, setSchedules] = useState<BusScheduleType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const currentDate = new Date();
    const fetchBusSchedule = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<BusScheduleType[]>('/bus-schedules/');
            setSchedules(response.data);
        } catch (err) {
            console.error('Ошибка при загрузке расписания:', err);
            setError('Не удалось загрузить расписание. Попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    const booking = async (busSchedule: BusScheduleType) => {
        const bookingObj = {
            bus_schedule_id: busSchedule.id,
            user_id: localStorage.getItem('userId'),
            booking_date: currentDate.toDateString(),
            status: "Выбран",
            total_price: busSchedule.schedule?.route?.price
        }
        const response = await api.post('/booking/create/', bookingObj);
        const { id } = response.data;
        const ticketObj = {
            booking_id: id,
            seat_number: 0,
            is_child: true,
            price: busSchedule.schedule?.route?.price
        }
        await api.post('/tickets/create/', ticketObj);
    }

    return (
        <HomeContext.Provider value={{
            busSchedules, loading, error, fetchBusSchedule, booking
        }}>
            {children}
        </HomeContext.Provider>
    );
};

export const useHome = () => {
    const context = useContext(HomeContext);
    if (!context) {
        throw new Error('useDashboard must be used within an HomeProvider');
    }
    return context;
};
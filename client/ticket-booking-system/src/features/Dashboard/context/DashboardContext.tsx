import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { RouteType } from '../types/RouteType';
import { DashboardContextType } from '../types/DashboardContextType';
import { ScheduleType } from '../types/ScheduleType';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [routes, setRoutes] = useState([]);
    const [trigger, setTrigger] = useState(0);
    const [schedules, setSchedules] = useState([]);
    const [is_update, setUpdate] = useState(false)

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

    const handleEdit = () => {
        console.log("abiba");
        setUpdate(true);
    };
    // const fetchRouteById = async (id: number) => {
    //     try {
    //         const response = await api.get(`/routes/${id}`);
    //         return response.data;
    //     } catch (error) {
    //         console.error('Error fetching route id ' + id, error)
    //     }
    // }

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

    return (
        <DashboardContext.Provider value={{ routes, trigger, is_update, handleEdit, NewRoute, UpdateRoute, fetchRoutes, DeleteRoute, schedules, fetchSchedules, NewSchedule, UpdateSchedule, DeleteSchedule }}>
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
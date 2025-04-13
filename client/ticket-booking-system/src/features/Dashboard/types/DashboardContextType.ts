import { BusScheduleType } from "./BusScheduleType";
import { BusType } from "./BusType";
import { RouteType } from "./RouteType";
import { ScheduleType } from "./ScheduleType";

export type DashboardContextType = {
    routes: any[];
    trigger: number;
    is_update: boolean;
    handleEdit: () => void;
    NewRoute: (newRoute: RouteType) => Promise<void>;
    UpdateRoute: (id: number, updRoute: RouteType) => Promise<void>;
    fetchRoutes: () => Promise<void>;
    DeleteRoute: (id: number) => Promise<void>;
    schedules: any[];
    fetchSchedules: () => Promise<void>;
    NewSchedule: (newRoute: ScheduleType) => Promise<void>;
    UpdateSchedule: (id: number, updSchedule: ScheduleType) => Promise<void>;
    DeleteSchedule: (id: number) => Promise<void>;
    busSchedules: any[];
    fetchBusSchedules: () => Promise<void>;
    NewBusSchedule: (newBusSchedule: BusScheduleType) => Promise<void>;
    UpdateBusSchedule: (id: number, updBusSchedule: BusScheduleType) => Promise<void>;
    DeleteBusSchedule: (id: number) => Promise<void>;
    buses: any[];
    fetchBuses: () => Promise<void>;
    NewBus: (newBus: BusType) => Promise<void>;
    UpdateBus: (id: number, updBusSchedule: BusType) => Promise<void>;
    DeleteBus: (id: number) => Promise<void>;
    users: any[];
    loading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    toggleUserBlock: (userId: number, blocked: boolean) => Promise<void>;
}
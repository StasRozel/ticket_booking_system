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
}
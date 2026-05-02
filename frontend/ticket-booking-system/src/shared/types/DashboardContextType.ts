import { BusScheduleResponse, BusScheduleType } from "./BusScheduleType";
import { BusType } from "./BusType";
import { RouteType } from "./RouteType";
import { ScheduleType } from "./ScheduleType";
import { UserType } from "./UserType";

export type DashboardContextType = {
    routes: RouteType[];
    trigger: number;
    isAddMode: boolean;
    isModalFormOpen: boolean;
    OpenModalForm: (flag: boolean, entity?: any) => void;
    CloseModalForm: () => void;
    createEntity: (route: string, newEntity: any) => Promise<void>;
    updateEntity: (route: string, id: number, updateEntity: any) => Promise<void>;
    deleteEntity: (route: string, id: number) => Promise<void>;
    fetchRoutes: () => Promise<void>;
    schedules: ScheduleType[];
    fetchSchedules: () => Promise<void>;
    busSchedules: BusScheduleType[];
    fetchBusSchedules: () => Promise<void>;
    buses: BusType[];
    fetchBuses: () => Promise<void>;
    currentEntity: any;
    users: UserType[];
    loading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    toggleUserBlock: (userId: number, blocked: boolean) => Promise<void>;
    fetchUrgentCalls: () => Promise<void>;
    replaceBusScheduleDriverAndBus: (id: number, driver_id: number, bus_id: number) => Promise<void>;
    urgentCalls: BusScheduleResponse[];
    fetchDriverComplaints: () => Promise<void>;
    driverComplaints: any[];
    deleteDriverComplaint: (id: number) => Promise<void>;
}
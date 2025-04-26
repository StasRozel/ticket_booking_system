import { BusScheduleType } from "./BusScheduleType";

export type HomeContextType = {
    busSchedules: BusScheduleType[];
    loading: boolean;
    error: string | null;
    fetchBusSchedule: () => Promise<void>;
    booking: (busSchedule: BusScheduleType) => Promise<void>;

}
import { BusType } from "./BusType";
import { ScheduleType } from "./ScheduleType";

export interface BusScheduleType {
    id?: number;
    schedule_id: number;
    bus_id: number;
    operating_days: string;
    schedule?: ScheduleType;
    bus?: BusType;
}

export interface BusScheduleResponse {
    success: boolean;
    data?: BusScheduleType;
    error?: string;
}
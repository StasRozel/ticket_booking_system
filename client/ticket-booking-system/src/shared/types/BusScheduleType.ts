import { BusType } from "./BusType";
import { ScheduleType } from "./ScheduleType";

export type BusScheduleType = {
    id?: number;
    schedule_id: number;
    bus_id: number;
    operating_days: string;
    schedule?: ScheduleType;
    bus?: BusType;
}
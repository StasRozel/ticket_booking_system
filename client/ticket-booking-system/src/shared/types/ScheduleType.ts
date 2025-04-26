import { RouteType } from "./RouteType";

export type ScheduleType = {
    id?: number,
    route_id: number;
    departure_time: string;
    arrival_time: string;
    route?: RouteType;
}
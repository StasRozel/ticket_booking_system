import { BusScheduleType } from "./BusScheduleType";

export type BookingType = {
  id: number;
  bus_schedule_id: number;
  user_id: number;
  booking_date: string;
  status: string;
  boarding_point?: string;
  busSchedule?: BusScheduleType;
}
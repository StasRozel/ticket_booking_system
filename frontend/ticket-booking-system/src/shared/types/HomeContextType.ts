// src/types/HomeContextType.ts
import { BusScheduleType } from './BusScheduleType';

export type HomeContextType = {
  busSchedules: BusScheduleType[];
  loading: boolean;
  error: string | null;
  fetchBusSchedule: () => Promise<void>;
  booking: (busSchedule: BusScheduleType) => Promise<void>;
  searchFrom: string;
  setSearchFrom: (value: string) => void;
  searchTo: string;
  setSearchTo: (value: string) => void;
  searchDate: string;
  setSearchDate: (value: string) => void;
  searchPassengers: string;
  setSearchPassengers: (value: string) => void;
};
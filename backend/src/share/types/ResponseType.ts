import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Urgentcall } from 'src/urgentcalls/entities/urgentcall.entity';

export type ResponseType = {
  success: boolean;
  data?: Schedule | Urgentcall;
  error?: string;
  message?: string;
};

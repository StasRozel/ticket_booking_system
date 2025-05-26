export type UserType = {
  id?: number;
  role_id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  phone_number: string;
  count_trips: number;
  is_blocked: boolean;
}
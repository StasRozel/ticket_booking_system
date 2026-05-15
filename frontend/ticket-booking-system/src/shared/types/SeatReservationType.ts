export type SeatReservationType = {
  id: number;
  bus_schedule_id: number;
  seat_number: number;
  user_id: number;
  boarding_point?: string;
  is_child: boolean;
  price: number;
  status: string;
  created_at: string;
  expires_at: string;
};

export type SeatMapSeatType = {
  seat_number: number;
  status: 'available' | 'occupied' | 'reserved';
  reserved_by: number | null;
};

export type SeatMapType = {
  busScheduleId: number;
  busNumber: string;
  busType: string;
  totalSeats: number;
  availableSeats: number;
  seats: SeatMapSeatType[];
  route: {
    id?: number;
    name: string;
    starting_point: string;
    ending_point: string;
    stops: string;
    distance: number;
    price: number;
  };
  departure_time: string;
  arrival_time: string;
};

export type ConfirmReservationResponseType = {
  booking: {
    id: number;
    bus_schedule_id: number;
    user_id: number;
    booking_date: string;
    status: string;
    boarding_point?: string;
    busSchedule?: any;
  };
  tickets: {
    id: number;
    booking_id: number;
    seat_number: number;
    is_child: boolean;
    price: number;
  }[];
};
export type TicketType = {
  id?: number;
  booking_id: number;
  seat_number: number;
  is_child: boolean;
  price: string;
}
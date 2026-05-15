export class CreateBookingDto {
  public user_id: number;
  public bus_schedule_id: number;
  public booking_date: string;
  public status: 'Выбран';
  public total_price: number;
  public boarding_point?: string;
}

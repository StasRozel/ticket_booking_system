export class CreateSeatReservationDto {
  public bus_schedule_id: number;
  public seat_number: number;
  public user_id: number;
  public boarding_point?: string;
  public is_child?: boolean;
  public price?: number;
}
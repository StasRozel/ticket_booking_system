import 'reflect-metadata';
import { Controller, Param, Body, Get, Post, Put, Delete, Patch } from 'routing-controllers';
import { bookingRepository } from '../repository/repository';
import { Booking } from '../entities/booking';

@Controller("/api/booking")
export class BookingController {
  @Get("/")
  async getAll() {
    return await bookingRepository.findAll();
  }

  @Get("/:user_id")
  async getBookingByUserId(@Param('user_id') id: number) {
    return await bookingRepository.findAllByUserId(id);
  }

  @Get("/schedule/:id")
  async getBookingByScheduleId(@Param('id') id: number) {
    const bookings = await bookingRepository.findAllByBusScheduleId(id);
    // sanitize user and include tickets only for this booking
    return bookings.map(b => {
      const user = { ...b.user } as any;
      if (user) {
        delete user.password;
        delete user.refresh_token;
      }
      // ensure tickets exist and belong to this booking
      const allTickets = (b as any).tickets || [];
      const tickets = allTickets
        .filter((t: any) => t.booking_id === b.id && b.bus_schedule_id === id)
        .map((t: any) => ({ id: t.id, seat_number: t.seat_number }));

      return {
        id: b.id,
        bus_schedule_id: b.bus_schedule_id,
        user_id: b.user_id,
        booking_date: b.booking_date,
        status: b.status,
        user,
        tickets
      };
    });
  }

  @Post("/create/")
  async createBooking(@Body() schedule: Booking) {
    return await bookingRepository.create(schedule);
  }

  @Patch("/update/:id")
  async updateBookingById(@Param('id') id: number, @Body() schedule: Booking) {
    return await bookingRepository.update(id, schedule);
  }

  @Patch("/cansel/:id")
  async canselBookingById(@Param('id') id: number, @Body() data: Booking) {
    return await bookingRepository.cansel(id, data);
  }

  @Patch("/:id/status")
  async updateBookingStatus(@Param('id') id: number, @Body() body: { status: string }) {
    return await bookingRepository.update(id, { status: body.status });
  }

  @Patch("/user/:user_id/status")
  async updateBookingStatusByUserId(@Param('user_id') user_id: number, @Body() body: { status: string }) {
    console.log(`Updating status for user ${user_id} to ${body.status}`);
    await bookingRepository.updateStatusByUserId(user_id, body.status);
    return { message: 'Status updated for user bookings' };
  }

  @Delete("/delete/:id")
  async deleteBookingById(@Param('id') id: number) {
    return await bookingRepository.delete(id);
  }
}
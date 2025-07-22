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

  @Delete("/delete/:id")
  async deleteBookingById(@Param('id') id: number) {
    return await bookingRepository.delete(id);
  }
}
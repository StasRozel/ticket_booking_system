import 'reflect-metadata';
import { Controller, Param, Body, Get, Post, Put, Delete, Patch } from 'routing-controllers';
import { ticketRepository } from '../repository/repository';
import { Ticket } from '../entities/tickets';

@Controller("/tickets")
export class TicketController {
  @Get("/")
  async getAll() {
    return await ticketRepository.findAll();
  }

  @Get("/:booking_id")
  async getTicketById(@Param('booking_id') id: number) {
    return await ticketRepository.findByBookingId(id);
  }

  @Post("/create/")
  async createTicket(@Body() ticket: Ticket) {
    return await ticketRepository.create(ticket);
  }

  @Patch("/update/:id")
  async updateTicketById(@Param('id') id: number, @Body() ticket: Ticket) {
    return await ticketRepository.update(id, ticket);
  }

  @Patch("/cansel/:id")
  async canselTicketById(@Param('id') id: number, @Body() ticket: Ticket) {
    return await ticketRepository.cansel(id, ticket);
  }

  @Delete("/delete/:id")
  async deleteTicketById(@Param('id') id: number) {
    return await ticketRepository.delete(id);
  }
}
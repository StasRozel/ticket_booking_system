import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { Stripe as StripeType } from 'stripe';
import Stripe from 'stripe';
import { Booking } from '../bookings/entities/booking.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class PaymentsService {
  private stripe: StripeType;

  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
    private bookingsService: BookingsService,
  ) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    this.stripe = new Stripe(secretKey, {});
  }

  async createCheckoutSession(bookingId: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: [
        'busSchedule',
        'busSchedule.schedule',
        'busSchedule.schedule.route',
      ],
    });

    if (!booking) {
      throw new Error('Бронирование не найдено');
    }

    const tickets = await this.ticketRepo.find({
      where: { booking_id: bookingId },
    });

    const totalAmount = tickets.reduce((sum, t) => sum + Number(t.price), 0);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'byn',
            product_data: {
              name: `Бронирование #${bookingId}`,
              description: `Маршрут: ${booking.busSchedule?.schedule?.route?.name || 'Не указан'}`,
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pending-bookings`,
      metadata: {
        booking_id: bookingId.toString(),
      },
    });

    return { url: session.url, sessionId: session.id };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    console.log('handleWebhook');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }

    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      let bookingId;
      if (session.metadata != null) {
        bookingId = parseInt(session.metadata.booking_id, 10);
      }

      if (isNaN(bookingId)) {
        console.error('Invalid booking_id in metadata');
        return { received: true };
      }

      await this.bookingsService.update(bookingId, {
        status: 'Забронирован',
      });

      console.log(`Booking #${bookingId} status updated to "Забронирован"`);
    }

    return { received: true };
  }
}

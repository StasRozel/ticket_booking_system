import { Controller, Post, Body, Req, Headers, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(@Body('bookingId') bookingId: number) {
    return this.paymentsService.createCheckoutSession(bookingId);
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = (req as any).rawBody;
    return this.paymentsService.handleWebhook(rawBody, signature);
  }
}

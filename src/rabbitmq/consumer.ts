import { rabbitMQ } from './connection';
import orderService from '../services/orderService';
import { publishStockUpdateOnFailed } from './publisher';

class Consumer {
  static async consumeStockUpdated(queue: string, onMessage: (message: any) => void): Promise<void> {
    await rabbitMQ.initialize();
    const channel = rabbitMQ.getChannel();

    await channel.assertQueue(queue, { durable: true });
    await channel.consume(queue, (msg) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        onMessage(data);
        channel.ack(msg);
      }
    });

    console.log(`Consumer bound to queue: ${queue} for stock updated messages.`);
  }

  static async consumeReservationFailed(queue: string, onMessage: (message: any) => void): Promise<void> {
    await rabbitMQ.initialize();
    const channel = rabbitMQ.getChannel();

    await channel.assertQueue(queue, { durable: true });
    await channel.consume(queue, (msg) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        onMessage(data);
        channel.ack(msg);
      }
    });

    console.log(`Consumer bound to queue: ${queue} for reservation failed messages.`);
  }

  static async consumePaymentSuccess(): Promise<void> {
    await rabbitMQ.initialize();
    const channel = rabbitMQ.getChannel();

    const queue = 'payment_success_queue';
    await channel.assertQueue(queue, { durable: true });
    await channel.consume(queue, async (msg) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        await orderService.handleOrderCompleted(data);
        channel.ack(msg);
      }
    });

    console.log(`Consumer bound to queue: ${queue} for payment success messages.`);
  }

  static async consumePaymentFailed(): Promise<void> {
    await rabbitMQ.initialize();
    const channel = rabbitMQ.getChannel();

    const queue = 'payment_failed_queue';
    await channel.assertQueue(queue, { durable: true });
    await channel.consume(queue, async (msg) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        const order = await orderService.handleOrderFailed(data);

        if (order) {
          await publishStockUpdateOnFailed(order);
        }

        channel.ack(msg);
      }
    });

    console.log(`Consumer bound to queue: ${queue} for payment failed messages.`);
  }
}

export default Consumer;

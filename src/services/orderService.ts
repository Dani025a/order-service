import { v4 as uuidv4 } from 'uuid';
import RabbitMQ from '../rabbitmq/connection';
import Publisher from '../rabbitmq/publisher';
import { ERROR_MESSAGES } from '../utils/messages';
import { Order, OrderStatus } from '../types/types';
import { prisma } from '../models';

class OrderService {
  public async createOrder(input: { order: Order }): Promise<Order> {
    const { userid, totalPrice, totalDiscountedPrice, currency, products } = input.order;

    if (!userid || !products || products.length === 0) {
      throw new Error(ERROR_MESSAGES.INVALID_ORDER_DATA);
    }

    const correlationId = uuidv4();
    const replyQueue = `order_reply_${correlationId}`;
    const channel = await RabbitMQ.connect();

    console.log('Creating order and sending validation request...');

    await channel.assertQueue(replyQueue, { exclusive: true });

    const validationRequest = {
      orderId: uuidv4(),
      userid,
      products,
      totalPrice,
      totalDiscountedPrice,
      currency,
    };

    const order = await prisma.order.create({
      data: {
        userid,
        totalPrice,
        totalDiscountedPrice,
        totalItems: products.reduce((sum, p) => sum + p.product.quantity, 0),
        currency,
        status: OrderStatus.PENDING,
        orderDate: new Date(),
      },
    });

    console.log('Order created with ID:', order.id);

    channel.sendToQueue('product.validation', Buffer.from(JSON.stringify(validationRequest)), {
      correlationId,
      replyTo: replyQueue,
    });

    console.log('Validation request sent to product.validation queue.');

    return new Promise((resolve, reject) => {
      channel.consume(
        replyQueue,
        async (message) => {
          if (message?.properties.correlationId === correlationId) {
            const response = JSON.parse(message!.content.toString());
            channel.ack(message!);

            console.log('Received response from replyQueue:', response);

            if (response.type === 'product.stock_updated') {
              await prisma.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.AWAITING_PAYMENT },
              });

              console.log('Order updated to AWAITING_PAYMENT status.');

              await Publisher.orderCreated({
                id: order.id,
                userid,
                products,
                totalPrice,
                totalDiscountedPrice,
                currency,
              });

              resolve(order);
            } else if (response.type === 'product.reservation_failed') {
              await prisma.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.CANCELLED },
              });

              console.error('Order update failed. Reason:', response.reason);

              reject(new Error(response.reason));
            }
          }
        },
        { noAck: false }
      );
    });
  }

  public async handleOrderCompleted(data: { id: string }) {
    const { id } = data;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      console.error(`Order with ID ${id} not found.`);
      return;
    }

    await prisma.order.update({
      where: { id },
      data: { status: OrderStatus.COMPLETED },
    });

    console.log(`Order ${id} marked as COMPLETED.`);
  }

  public async handleOrderFailed(data: { id: string; reason: string }) {
    const { id, reason } = data;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      console.error(`Order with ID ${id} not found.`);
      return;
    }

    await prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });

    console.error(`Order ${id} marked as CANCELLED. Reason: ${reason}`);
  }
  
}

export default new OrderService()
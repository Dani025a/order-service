import { v4 as uuidv4 } from 'uuid';
import Consumer from '../rabbitmq/consumer';
import { ERROR_MESSAGES } from '../utils/messages';
import { Order, OrderStatus } from '../types/types';
import { prisma } from '../models';
import { publishProductValidation } from '../rabbitmq/publisher';

class OrderService {
  public async createOrder(input: { order: Order }): Promise<Order> {
    const { userid, totalPrice, totalDiscountedPrice, currency, products } = input.order;
    if (!userid || !products || products.length === 0) {
      throw new Error(ERROR_MESSAGES.INVALID_ORDER_DATA);
    }

    const correlationId = uuidv4();
    const replyQueue = `order_reply_${correlationId}`;

    console.log('Creating order and sending validation request...');

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

    const validationRequest = {
      orderId: order.id,
      userid,
      products,
      totalPrice,
      totalDiscountedPrice,
      currency,
    };

    await publishProductValidation(validationRequest, correlationId, replyQueue);

    console.log('Validation request sent to product.validation queue.');

    return new Promise((resolve, reject) => {
      Consumer.consumeStockUpdated(replyQueue, async (message) => {
        const response = JSON.parse(message.content.toString());

        if (response.type === 'product.stock_updated') {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.AWAITING_PAYMENT },
          });

          console.log('Order updated to AWAITING_PAYMENT status.');

          resolve(order);
        } else if (response.type === 'product.reservation_failed') {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.CANCELLED },
          });

          console.error('Order update failed. Reason:', response.reason);
          reject(new Error(response.reason));
        }
      });
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

    console.log(`Order ${id} marked as CANCELLED due to: ${reason}.`);

    return order;
  }
  
}

export default new OrderService()
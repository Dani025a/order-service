import { Request, Response } from 'express';
import orderService from '../services/orderService';
import { prisma } from '../models';

class OrderController {
  async create(req: Request, res: Response) {
    const { order } = req.body; 
    const userid = req.user.userId;
    try {
      if (!userid || !order.products || order.products.length === 0) {
        return res.status(400).json({ error: 'Invalid order data' });
      }


      const orderCreated = await orderService.createOrder({
        order: {
          userid: userid,
          totalPrice: order.totalPrice,
          totalDiscountedPrice: order.totalDiscountedPrice,
          totalItems: 0,
          products: order.products,
          currency: order.currency,
        },
      });

      console.log(orderCreated)

      return res.status(201).json(orderCreated);
    } catch (error: any) {
      console.error('Error creating order:', error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  async getOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      return res.json(order);
    } catch (error: any) {
      console.error('Error retrieving order:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new OrderController();

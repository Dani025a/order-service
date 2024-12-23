import RabbitMQ from './connection';

class Publisher {
  static async orderCreated(event: {
    id: string;
    userid: number;
    products: any[];
    totalPrice: number;
    totalDiscountedPrice: number;
    currency: string;
  }) {
    console.log('orderCreated event triggered with data:', event);
    await this.publish('order.exchange', 'order.created', event);
  }

  private static async publish(exchange: string, routingKey: string, message: object) {
    try {
      const channel = await RabbitMQ.connect();
      console.log(`Publishing to exchange: ${exchange}, routingKey: ${routingKey}`);
      console.log('Message:', message);

      channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), { persistent: true });

      console.log('Message published successfully.');
    } catch (error) {
      console.error('Error publishing message:', error);
      throw error; 
    }
  }
}

export default Publisher;

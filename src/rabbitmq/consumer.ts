import orderService from '../services/orderService';
import RabbitMQ from './connection';

export const startConsumers = async () => {
  const channel = await RabbitMQ.connect();

  const consumers = [
    {
      queue: 'order.completed.queue',
      exchange: 'order.exchange',
      routingKey: 'order.completed',
      handler: orderService.handleOrderCompleted,
    },
    {
      queue: 'order.failed.queue',
      exchange: 'order.exchange',
      routingKey: 'order.failed',
      handler: orderService.handleOrderFailed,
    },
    {
      queue: 'product.validation.reply.queue',
      exchange: 'product.exchange',
      routingKey: 'product.validation.reply',
      handler: async (data: any) => {
        console.log('Received validation reply:', data);
      },
    },
  ];

  for (const { queue, exchange, routingKey, handler } of consumers) {
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    channel.consume(queue, async (message: any) => {
      if (message) {
        try {
          const data = JSON.parse(message.content.toString());
          await handler(data);
          channel.ack(message);
        } catch (error) {
          console.error(`Error processing message from ${queue}:`, error);
          channel.nack(message, false, false);
        }
      }
    });

    console.log(`Listening on queue: ${queue}, exchange: ${exchange}, routingKey: ${routingKey}`);
  }
};

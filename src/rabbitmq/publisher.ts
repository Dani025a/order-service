import { rabbitMQ } from "./connection";

const EXCHANGE_NAME = "stock_update_on_failed"

export const publishStockUpdateOnFailed = async (message: any): Promise<void> => {
  const channel = rabbitMQ.getChannel();
  await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
  channel.publish(EXCHANGE_NAME, "", Buffer.from(message));
  console.log(`Message published to exchange ${EXCHANGE_NAME}: ${message}`);
};

export const publishProductValidation = async (message: any, correlationId: string, replyTo: string): Promise<void> => {
  await rabbitMQ.initialize();
  const channel = rabbitMQ.getChannel();

  const exchange = 'product.validation';

  await channel.assertExchange(exchange, 'direct', { durable: true });

  channel.publish(
    exchange,
    '',
    Buffer.from(JSON.stringify(message)),
    {
      correlationId,
      replyTo,
    }
  );

  console.log(`Message published to exchange ${exchange}:`, message);
};

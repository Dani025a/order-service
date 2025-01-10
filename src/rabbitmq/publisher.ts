import { rabbitMQ } from "./connection";

const EXCHANGE_NAME = "stock_update_on_failed"

export const publishStockUpdateOnFailed = async (message: any): Promise<void> => {
  const channel = rabbitMQ.getChannel();
  await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
  channel.publish(EXCHANGE_NAME, "", Buffer.from(message));
  console.log(`Message published to exchange ${EXCHANGE_NAME}: ${message}`);
};

export const publishProductValidation = async (
  message: any,
  correlationId: string,
  replyQueue: string
): Promise<void> => {
  await rabbitMQ.initialize();
  const channel = rabbitMQ.getChannel();

  const exchange = 'product.validation';
  const routingKey = 'product.validation';

  // Assert the reply queue to ensure it exists
  await channel.assertQueue(replyQueue, { durable: false });

  await channel.assertExchange(exchange, 'direct', { durable: true });

  // Publish the validation request
  const published = channel.publish(
    exchange,
    routingKey,
    Buffer.from(JSON.stringify(message)),
    {
      correlationId,
      replyTo: replyQueue,
    }
  );

  if (published) {
    console.log(`Published message to exchange ${exchange} with routingKey ${routingKey}`);
  } else {
    console.error('Failed to publish message to product.validation exchange.');
  }
};

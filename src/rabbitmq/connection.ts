import amqp, { Channel, Connection } from 'amqplib';

class RabbitMQ {
  private static connection: Connection;
  private static channel: Channel;

  static async connect(): Promise<Channel> {
    if (!this.channel) {
      console.log('Connecting to RabbitMQ...');
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      console.log('RabbitMQ connection established.');

      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange('order.exchange', 'topic', { durable: true });
      console.log('Exchange "order.exchange" asserted successfully.');

      await this.channel.assertExchange('product.exchange', 'topic', { durable: true });
      console.log('Exchange "product.exchange" asserted successfully.');
    }

    return this.channel;
  }

  static async close() {
    if (this.connection) {
      await this.connection.close();
      console.log('RabbitMQ connection closed.');
    }
  }
}

export default RabbitMQ;

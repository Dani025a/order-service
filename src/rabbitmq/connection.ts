import amqplib, { Connection, Channel } from 'amqplib';

class RabbitMQ {
  private connection!: Connection;
  private channel!: Channel;

  public async connect(): Promise<void> {
    const url = process.env.RABBITMQ_URL;
    if (!url) {
      throw new Error('RABBITMQ_URL is not defined in the environment variables.');
    }

    if (!this.connection) {
      this.connection = await amqplib.connect(url);
      this.channel = await this.connection.createChannel();
      console.log('RabbitMQ connected');
    }
  }

  public getChannel(): Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized. Call connect first.');
    }
    return this.channel;
  }

  public async initialize(): Promise<void> {
    if (!this.connection) {
      await this.connect();
    }
  }

  public async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      console.log('RabbitMQ connection closed');
    }
  }
}

export const rabbitMQ = new RabbitMQ();

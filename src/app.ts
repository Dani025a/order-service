import express from 'express';
import orderRoutes from './routes/orderRoutes';
import cors from 'cors'
import Consumer from './rabbitmq/consumer';
import { rabbitMQ } from './rabbitmq/connection';

const app = express();
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

  (async () => {
    try {
      await rabbitMQ.initialize();
      console.log('RabbitMQ is ready for operations.');
      await Consumer.consumePaymentSuccess();
      await Consumer.consumePaymentFailed();
      
    } catch (error) {
      console.error('Failed to initialize RabbitMQ:', error);
      process.exit(1);
    }
  })();
  
app.use(cors(corsOptions));
app.use('/api/orders', orderRoutes);
export default app;

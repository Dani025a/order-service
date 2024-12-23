import express from 'express';
import orderRoutes from './routes/orderRoutes';
import cors from 'cors'
import { startConsumers } from './rabbitmq/consumer';

const app = express();
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

  (async () => {
    try {
      await startConsumers();
      console.log('RabbitMQ consumers are running.');
    } catch (error) {
      console.error('Failed to start RabbitMQ consumers:', error);
    }
  })();
  
app.use(cors(corsOptions));
app.use('/api/orders', orderRoutes);
export default app;

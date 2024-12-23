import 'dotenv/config';
import app from './app';
import { startConsumers } from './rabbitmq/consumer';

startConsumers().catch(console.error);
const PORT = process.env.ORDER_PORT || 1007;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));

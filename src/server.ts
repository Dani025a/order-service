import 'dotenv/config';
import app from './app';

const PORT = process.env.ORDER_PORT || 1007;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));

import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health';
import elevenlabsRoutes from './routes/elevenlabs';
import searchRoutes from './routes/search';
import chatRoutes from './routes/chat';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/elevenlabs', elevenlabsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);

app.use(errorHandler);

export default app;

import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

app.use(cors());
app.use(express.json());

const events: any[] = [];

// Recebe evento
app.post('/events', async (req: Request, res: Response) => {
  const event = req.body;

  events.push(event);

  try {
    // Serviço de posts
    await axios.post('http://localhost:8001/events', event);

    // Serviço de comentários
    await axios.post('http://localhost:8002/events', event);

    // Serviço de consultas
    await axios.post('http://localhost:8003/events', event);

  } catch (error) {
    console.log('Erro ao enviar evento:', error);
  }

  res.status(200).send({ status: 'OK' });
});

// Histórico de eventos
app.get('/events', (req: Request, res: Response) => {
  res.send(events);
});

app.listen(9000, () => {
  console.log('Event Bus rodando na porta 9000');
});
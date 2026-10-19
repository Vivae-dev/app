import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
const bodyParser = require('body-parser');

const app = express();

const port = parseInt(process.env.BARRAMENTO_PORT || '10000', 10);
const host = process.env.HOST || 'localhost';

const CATALOGO_URL = process.env.CATALOGO_URL || 'http://localhost:8001';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:8002';
const RESERVA_URL = process.env.RESERVA_URL || 'http://localhost:8003';

app.use(cors());
app.use(express.json());

app.use(bodyParser.json());

app.post('/eventos', (req, res) => {
    const evento = req.body;
    // Sem catch, um serviço fora do ar gera unhandledRejection e derruba o barramento
    const repassar = (url: string) =>
        axios.post(url, evento).catch((err) =>
            console.error(`Falha ao repassar ${evento?.tipo} para ${url}: ${err.message}`));
    repassar(`${CATALOGO_URL}/api/eventos`);
    repassar(`${AUTH_URL}/api/auth/eventos`);
    repassar(`${RESERVA_URL}/api/eventos`);
   res.status(200).send({ msg: "ok" });
});

app.listen(port, host, () => {
    console.log(`Barramento de eventos. Porta ${port}.`)
 })

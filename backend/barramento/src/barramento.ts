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
    axios.post(`${CATALOGO_URL}/api/eventos`, evento);
    axios.post(`${AUTH_URL}/api/auth/eventos`, evento);
    axios.post(`${RESERVA_URL}/api/eventos`, evento);
   res.status(200).send({ msg: "ok" });
});

app.listen(port, host, () => {
    console.log(`Barramento de eventos. Porta ${port}.`)
 })

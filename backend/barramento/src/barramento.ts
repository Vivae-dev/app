import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(express.json());

const events: any[] = [];

app.use(bodyParser.json());

app.post('/eventos', (req, res) => {
    const evento = req.body;
    //envia o evento para o microsserviço de lembretes
    axios.post('http://localhost:4000/eventos', evento);
    //envia o evento para o microsserviço de observações
    axios.post('http://localhost:5000/eventos', evento);
    res.status(200).send({ msg: "ok" });
});

app.listen(10000, () => {
    console.log('Barramento de eventos. Porta 10000.')
 })

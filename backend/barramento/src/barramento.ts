import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(express.json());

app.use(bodyParser.json());

app.post('/eventos', (req, res) => {
    const evento = req.body;
    axios.post('http://localhost:8001/api/eventos', evento);
    //axios.post('http://localhost:8002/eventos', evento);
    axios.post('http://localhost:8003/api/eventos', evento);
    res.status(200).send({ msg: "ok" });
});

app.listen(10000, () => {
    console.log('Barramento de eventos. Porta 10000.')
 })

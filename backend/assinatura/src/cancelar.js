const express = require('express');
const app = express();
app.use(express.json());

app.put('/api/assinaturas/:id/cancelar', async (req, res) => {
    const { id } = req.params;

    try {
        
        console.log(`Assinatura ${id} cancelada com sucesso.`);
        return res.status(200).json({ message: '✅ Assinatura cancelada com sucesso!' });
    } catch (error) {
        return res.status(500).json({ message: '❌ Erro ao cancelar assinatura.' });
    }
});

const PORT = process.env.PORT || 8004;
app.listen(PORT, () => console.log(`Microservice Assinatura rodando na porta ${PORT}`));
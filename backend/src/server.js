const express = require('express')
const { Pool } = require('pg')

const app = express()
app.use(express.json())

let pool

const conectar = async () => {
    try {
        pool = new Pool({
            host: "vivae-lelegallas-c560.d.aivencloud.com",
            user: "avnadmin",
            password: "AVNS_bu1pxXg1Xjgkdovd6wL",
            database: "defaultdb",
            port: 28717,
            ssl: {
                rejectUnauthorized: false
            }
        })

        console.log("Conectado ao PostgreSQL")
    } catch (erro) {
        console.log(`Erro ao conectar com o banco: ${erro}`)
    }
}
conectar()

// CREATE
app.post('/cadastro', async (req, res) => {
    try {
        const {senha_hash, email, nome_completo, endereco} = req.body

        const resultado = await pool.query(
            `INSERT INTO usuarios (senha_hash, email, nome_completo, endereco, data_criacao) 
             VALUES ($1, $2, $3, $4, $5) 
             `,
            [senha_hash, email, nome_completo, endereco, new Date()]
        )

        res.status(201).json({
            senha_hash:senha_hash,
            email:email,
            nome_completo:nome_completo,
            endereco:endereco
        })

    } catch (erro) {
        console.log(erro)
        res.status(500).json({
            erro: "Erro ao inserir usuário"
        })
    }
})

app.get('/', (req, res) => {
    res.json({
        mensagem: 'Servidor funcionando!'
    })
})

const port = 3000
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})

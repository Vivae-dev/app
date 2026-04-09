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
        const {username, senha_hash, email, nome_completo} = req.body

        const resultado = await pool.query(
            `INSERT INTO usuarios (username, senha_hash, email, nome_completo) 
             VALUES ($1, $2, $3, $4) 
             `,
            [username, senha_hash, email, nome_completo]
        )

        res.status(201).json({
            username:username,
            senha_hash:senha_hash,
            email:email,
            nome_completo:nome_completo,
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

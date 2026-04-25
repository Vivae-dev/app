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

// inserir usuário
app.post('/cadastro', async (req, res) => {
    try {
        const {name, email, password, address, createdAt} = req.body

        const resultado = await pool.query(
            `INSERT INTO usuarios (nome_completo, email, senha_hash, endereco, data_criacao) 
             VALUES ($1, $2, $3, $4, $5) 
             `,
            [name, email, password, address, createdAt]
        )

        res.status(201).json({
            password:password,
            email:email,
            name:name,
            address:address,
            createdAt : createdAt
        })

    } catch (erro) {
        console.log(erro)
        res.status(500).json({
            erro: "Erro ao inserir usuário"
        })
    }
})

//Conferir usuário duplicado
app.get('/cadastro', async (req, res) => {
    try {
        const { email } = req.body;

        const result = await pool.query(
            'SELECT email FROM usuarios WHERE email = $1',
            [email]
        );

        if (result.rows.length > 0) {
            res.json("Já existe");
        } else {
            res.json("clear");
        }

        console.log(result.rows);

    } catch (error) {
        console.log(`Erro ao obter email: ${error}`);
        res.status(500).json({
            erro: 'Erro ao obter email'
        });
    }
});


app.get('/', (req, res) => {
    res.json({
        mensagem: 'Servidor funcionando!'
    })
})

const port = 3000
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})

const {Pool} = require('pg') //fazendo conexao com o postgre
require('dotenv').config(); //para nosso bd online

/*BANCO DE DADOS LOCAL */
// const BD = new Pool({ //BD = banco de dados
//     user: 'postgres', //nome usuario (proprietario) do bando de dados
//     host: 'localhost', //endereco do servidor, no nosso caso é local
//     database: 'bd_estoque', //nome do banco de dados (deve estar igual ao nome no postgre)
//     password: 'admin', //senha do bando de dados
//     port: 5432, //porta de conexao do servidor
// })

/*BANCO DE DADOS ONLINE (upload feito dia 05/12/2024) */
const BD = new Pool({
    connectionString : process.env.DATABASE_URL
});



module.exports = BD
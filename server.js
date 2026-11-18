// CARREGAR VARIÁVEIS DO .ENV
require("dotenv").config();

// IMPORTAR APP E BANCO DE DADOS
const app = require("./app");
const pool = require("./src/database/db");

// DEFINIR PORTA
const PORTA = process.env.PORTA || 3000;

// TESTAR CONEXÃO COM O BANCO
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Erro ao conectar:", err);
  } else {
    console.log("Banco conectado:", res.rows[0].now);
  }
});

// INICIAR O SERVIDOR
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
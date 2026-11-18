
// CARREGAR VARIÁVEIS DO .ENV
require("dotenv").config();

// CONFIGURAÇÃO DO EXPRESS
const express = require("express");
const cors = require("cors");
const app = express();

// IMPORTAR ROTAS
const tarefasRoutes = require("./src/routes/tarefas.routes");
const usuariosRoutes = require("./src/routes/usuarios.routes");
const projetosRoutes = require("./src/routes/projetos.routes");
const authRoutes = require("./src/routes/auth.routes");
const prioridadesRoutes = require("./src/routes/prioridades.routes");
const comentariosRoutes = require("./src/routes/comentarios.routes");

// CONFIGURAÇÃO DO SWAGGER
const swaggerUi = require("swagger-ui-express");
const openapi = require("./src/docs/openapi");

const SWAGGER_CDN = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14";

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openapi, {
    customCssUrl: `${SWAGGER_CDN}/swagger-ui.css`,
    customJs: [
      `${SWAGGER_CDN}/swagger-ui-bundle.js`,
      `${SWAGGER_CDN}/swagger-ui-standalone-preset.js`,
    ],
  }),
);

// IMPORTAR MIDDLEWARES
const autenticar = require("./src/middlewares/autenticar");
const validarContentType = require("./src/middlewares/validarContentType");
const logger = require("./src/middlewares/logger");
const temporizador = require("./src/middlewares/temporizador");
const tratarErros = require("./src/middlewares/erro.middleware");
const criarErro = require("./utils/criarErro");

// CONFIGURAÇÃO DO CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);

// RECEBER DADOS EM JSON
app.use(express.json());

// MIDDLEWARES
app.use(validarContentType);
app.use(logger);
app.use(temporizador);

// ROTA DE LOGIN
app.use("/auth", authRoutes);

// ROTA INICIAL DA API
app.get("/", (req, res) => {
  res.json({
    api: "TaskFlow",
    versao: "1.0",
    status: "online",
  });
});

// ROTAS DE USUÁRIOS
app.use("/usuarios", usuariosRoutes);

// ROTAS DE TAREFAS
app.use("/tarefas", autenticar, tarefasRoutes);

// ROTAS DE PROJETOS
app.use("/projetos", autenticar, projetosRoutes);

// ROTAS DE PRIORIDADES
app.use("/prioridades", prioridadesRoutes);

// ROTAS DE COMENTÁRIOS
app.use("/comentarios", comentariosRoutes);

// ROTA NÃO ENCONTRADA
app.use((req, res) => {
  const rota = `${req.method} ${req.url}`;
  throw criarErro(404, `Rota ${rota} não encontrada`);
});

// TRATAMENTO DE ERROS
app.use(tratarErros);

// EXPORTAR O APP
module.exports = app;

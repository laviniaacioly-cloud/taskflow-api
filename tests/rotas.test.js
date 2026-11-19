const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const prisma = require("../src/database/prisma");

afterAll(async () => {
  await prisma.$disconnect(); // ou await pool.end();
});

const USUARIO_ID = 1;
const PROJETO_ID = 1;
const PRIORIDADE_ID = 1;

// Um token válido, com o mesmo segredo que o autenticar confere
const token = jwt.sign({ id: 1, nome: "Teste" }, process.env.JWT_SECRET);

// O logger, o temporizador e o tratarErros escrevem no terminal
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

describe("rotas da API", () => {
  test("GET / responde 200 com a mensagem da API", async () => {
    const resposta = await request(app).get("/");
    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({
      api: "TaskFlow",
      versao: "1.0",
      status: "online",
    });
  });

  test("rota que não existe responde 404", async () => {
    const resposta = await request(app).get("/nao-existe");
    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.mensagem).toBe(
      "Rota GET /nao-existe não encontrada",
    );
  });
  test("GET /tarefas sem token responde 401", async () => {
    const resposta = await request(app).get("/tarefas");
    expect(resposta.status).toBe(401);
  });

  test("GET /tarefas com token falso responde 401", async () => {
    const resposta = await request(app)
      .get("/tarefas")
      .set("Authorization", "Bearer abc.def.ghi");
    expect(resposta.status).toBe(401);
  });

  test("POST /tarefas inválido responde 400", async () => {
    const resposta = await request(app)
      .post("/tarefas")
      .set("Authorization", `Bearer ${token}`)
      .send({ texto: "" });
    expect(resposta.status).toBe(200);
    expect(resposta.body.erro.mensagem).toBe("Dados inválidos");
  });

  test("POST /tarefas sem JSON responde 415", async () => {
    const resposta = await request(app)
      .post("/tarefas")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "text/plain")
      .send("texto solto");
    expect(resposta.status).toBe(415);
  });

  test("GET /prioridades sem token responde 401", async () => {
    const resposta = await request(app).get("/prioridades");

    expect(resposta.status).toBe(401);
  });

  test("GET /prioridades com token de segredo errado responde 401", async () => {
    const tokenFalso = jwt.sign({ id: 1, nome: "Teste" }, "segredo-errado");

    const resposta = await request(app)
      .get("/prioridades")
      .set("Authorization", `Bearer ${tokenFalso}`);

    expect(resposta.status).toBe(401);
  });

  test("POST /tarefas sem dados responde 400", async () => {
    const resposta = await request(app)
      .post("/tarefas")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.mensagem).toBe("Dados inválidos");
  });

  test("POST /tarefas com coluna inválida responde 400", async () => {
    const resposta = await request(app)
      .post("/tarefas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        texto: "Tarefa de teste",
        prioridade_id: 1,
        projeto_id: 1,
        coluna: "feito",
      });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.mensagem).toBe("Dados inválidos");
  });

  test("GET rota inexistente com token responde 404", async () => {
    const resposta = await request(app)
      .get("/rota-inexistente")
      .set("Authorization", `Bearer ${token}`);

    expect(resposta.status).toBe(404);
  });

  test("GET /prioridades com token: 200 e uma lista", async () => {
    const resposta = await request(app)
      .get("/prioridades")
      .set("Authorization", `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });

  test("POST /tarefas cria, GET busca e DELETE remove", async () => {
    const nova = {
      texto: "Tarefa criada pelo teste",
      coluna: "afazer",
      usuario_id: USUARIO_ID,
      projeto_id: PROJETO_ID,
      prioridade_id: PRIORIDADE_ID,
    };

    // 1. Criar a tarefa
    const criada = await request(app)
      .post("/tarefas")
      .set("Authorization", `Bearer ${token}`)
      .send(nova);

    expect(criada.status).toBe(201);
    expect(criada.body).toHaveProperty("id");

    const idTarefa = criada.body.id;

    // 2. Buscar a tarefa criada
    const buscada = await request(app)
      .get(`/tarefas/${idTarefa}`)
      .set("Authorization", `Bearer ${token}`);

    expect(buscada.status).toBe(200);
    expect(buscada.body.texto).toBe(nova.texto);

    // 3. Remover a tarefa
    const removida = await request(app)
      .delete(`/tarefas/${idTarefa}`)
      .set("Authorization", `Bearer ${token}`);

    expect(removida.status).toBe(200);

    // 4. Tentar buscar a tarefa removida
    const naoEncontrada = await request(app)
      .get(`/tarefas/${idTarefa}`)
      .set("Authorization", `Bearer ${token}`);

    expect(naoEncontrada.status).toBe(404);
    expect(naoEncontrada.body.erro.mensagem).toBe("Tarefa não encontrada");
  });

  test("GET /tarefas/999999 responde 404", async () => {
    const resposta = await request(app)
      .get("/tarefas/999999")
      .set("Authorization", `Bearer ${token}`);

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.mensagem).toBe("Tarefa não encontrada");
  });

  test("GET /tarefas com token retorna 200 e uma lista", async () => {
    const resposta = await request(app)
      .get("/tarefas")
      .set("Authorization", `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });

  test("GET /projetos com token retorna 200 e uma lista", async () => {
    const resposta = await request(app)
      .get("/projetos")
      .set("Authorization", `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });
});

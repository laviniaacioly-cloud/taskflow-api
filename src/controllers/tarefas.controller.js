
const tarefaModel = require("../models/tarefa.model");
const criarErro = require("../../utils/criarErro");

const tarefasController = {
  // LISTAR TAREFAS
  async listar(req, res) {
    const usuarioId = req.usuario.id;

    const tarefas = await tarefaModel.listarPorUsuario(usuarioId);

    const { coluna } = req.query;

    const resultado = coluna
      ? tarefas.filter((tarefa) => tarefa.coluna === coluna)
      : tarefas;

    res.json(resultado);
  },

  // ESTATÍSTICAS
  async estatisticas(req, res) {
    const usuarioId = req.usuario.id;

    const estatisticas = await tarefaModel.estatisticas(usuarioId);

    res.json(estatisticas);
  },

  // RESUMO
  async resumo(req, res) {
    const usuarioId = req.usuario.id;

    const resumo = await tarefaModel.resumo(usuarioId);

    res.json(resumo);
  },

  // BUSCAR POR ID
  async buscarPorId(req, res) {
    const id = Number(req.params.id);
    const usuarioId = req.usuario.id;

    const tarefa = await tarefaModel.buscar(id, usuarioId);

    if (!tarefa) {
      throw criarErro(404, "Tarefa não encontrada");
    }

    res.json(tarefa);
  },

  // CRIAR TAREFA
  async criar(req, res) {
    const {
      texto,
      prioridade_id,
      prioridade,
      coluna,
      projeto_id,
    } = req.body;

    const usuarioId = req.usuario.id;

    if (!texto || !texto.trim()) {
      throw criarErro(400, "Texto obrigatório");
    }

    const novaTarefa = await tarefaModel.adicionar({
      texto: texto.trim(),
      prioridade_id,
      prioridade,
      coluna,
      usuarioId,
      projetoId: projeto_id,
    });

    res.status(201).json(novaTarefa);
  },

  // ATUALIZAR TAREFA
  async atualizar(req, res) {
    const id = Number(req.params.id);
    const usuarioId = req.usuario.id;

    const dadosAtualizacao = { ...req.body };

    // O responsável não pode ser alterado pelo formulário
    delete dadosAtualizacao.usuario_id;
    delete dadosAtualizacao.usuarioId;

    // Datas são controladas pelo backend
    delete dadosAtualizacao.iniciada_em;
    delete dadosAtualizacao.concluida_em;
    delete dadosAtualizacao.concluidaEm;

    const atualizada = await tarefaModel.atualizar(
      id,
      usuarioId,
      dadosAtualizacao,
    );

    if (!atualizada) {
      throw criarErro(404, "Tarefa não encontrada");
    }

    res.json(atualizada);
  },

  // EXCLUIR TAREFA
  async remover(req, res) {
    const id = Number(req.params.id);
    const usuarioId = req.usuario.id;

    const removida = await tarefaModel.remover(id, usuarioId);

    if (!removida) {
      throw criarErro(404, "Tarefa não encontrada");
    }

    res.status(200).json({
      mensagem: "Tarefa excluída com sucesso",
    });
  },
};

module.exports = tarefasController;

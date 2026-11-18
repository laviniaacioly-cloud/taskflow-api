
const projetoModel = require("../models/projeto.model");
const tarefaModel = require("../models/tarefa.model");

const projetosController = {
  // GET - LISTAR PROJETOS DO USUÁRIO
  async listarProjetos(req, res) {
    try {
      const usuarioId = req.usuario.id;

      const projetos = await projetoModel.listarProjetos(usuarioId);

      res.json(projetos);
    } catch (erro) {
      console.error("Erro ao listar projetos:", erro);
      res.status(500).json({ erro: "Erro ao listar projetos" });
    }
  },

  // GET - RESUMO DO PROJETO
  async resumoProjeto(req, res) {
    try {
      const id = Number(req.params.id);
      const usuarioId = req.usuario.id;

      const projeto = await projetoModel.buscarProjeto(id, usuarioId);

      if (!projeto) {
        return res.status(404).json({
          erro: "Projeto não encontrado",
        });
      }

      const tarefas = await tarefaModel.listarPorUsuario(usuarioId);

      const tarefasDoProjeto = tarefas.filter(
        (t) => Number(t.projeto_id ?? t.projetoId) === id,
      );

      const porColuna = {
        afazer: tarefasDoProjeto.filter((t) => t.coluna === "afazer").length,
        andamento: tarefasDoProjeto.filter((t) => t.coluna === "andamento")
          .length,
        concluido: tarefasDoProjeto.filter((t) => t.coluna === "concluido")
          .length,
      };

      res.json({
        projeto,
        totalTarefas: tarefasDoProjeto.length,
        porColuna,
      });
    } catch (erro) {
      console.error("Erro ao buscar resumo do projeto:", erro);
      res.status(500).json({
        erro: "Erro ao buscar resumo do projeto",
      });
    }
  },

  // GET - BUSCAR PROJETO POR ID
  async buscarProjetosId(req, res) {
    try {
      const id = Number(req.params.id);
      const usuarioId = req.usuario.id;

      const projeto = await projetoModel.buscarProjeto(id, usuarioId);

      if (!projeto) {
        return res.status(404).json({
          erro: "Projeto não encontrado",
        });
      }

      res.json(projeto);
    } catch (erro) {
      console.error("Erro ao buscar projeto:", erro);
      res.status(500).json({
        erro: "Erro ao buscar projeto",
      });
    }
  },

  // POST - CRIAR PROJETO
  async criarProjetos(req, res) {
    try {
      const { nome, descricao } = req.body;
      const usuarioId = req.usuario.id;

      if (!nome || nome.trim() === "") {
        return res.status(400).json({
          erro: "Obrigatório informar o nome do projeto!",
        });
      }

      const novoProjeto = await projetoModel.adicionarProjeto({
        nome: nome.trim(),
        descricao: descricao || "",
        usuarioId,
      });

      res.status(201).json(novoProjeto);
    } catch (erro) {
      console.error("Erro ao criar projeto:", erro);
      res.status(500).json({
        erro: "Erro ao criar projeto",
      });
    }
  },

  // PUT - EDITAR PROJETO
  async atualizarProjetos(req, res) {
    try {
      const id = Number(req.params.id);
      const usuarioId = req.usuario.id;

      const projetoExistente = await projetoModel.buscarProjeto(
        id,
        usuarioId,
      );

      if (!projetoExistente) {
        return res.status(404).json({
          erro: "Projeto não encontrado",
        });
      }

      const atualizado = await projetoModel.atualizarProjeto(
        id,
        usuarioId,
        req.body,
      );

      res.json(atualizado);
    } catch (erro) {
      console.error("Erro ao atualizar projeto:", erro);
      res.status(500).json({
        erro: "Erro ao atualizar projeto",
      });
    }
  },

  // DELETE - EXCLUIR PROJETO
  async removerProjetos(req, res) {
    try {
      const id = Number(req.params.id);
      const usuarioId = req.usuario.id;

      const projeto = await projetoModel.buscarProjeto(id, usuarioId);

      if (!projeto) {
        return res.status(404).json({
          erro: "Projeto não encontrado",
        });
      }

      const tarefas = await tarefaModel.listarPorUsuario(usuarioId);

      const tarefasDoProjeto = tarefas.filter(
        (t) => Number(t.projeto_id ?? t.projetoId) === id,
      );

      if (tarefasDoProjeto.length > 0) {
        return res.status(409).json({
          erro: "Projeto possui tarefas associadas.",
        });
      }

      const removido = await projetoModel.removerProjetos(
        id,
        usuarioId,
      );

      if (!removido) {
        return res.status(404).json({
          erro: "Projeto não encontrado",
        });
      }

      res.json({
        mensagem: "Projeto removido com sucesso",
        projeto: removido,
      });
    } catch (erro) {
      console.error("Erro ao remover projeto:", erro);
      res.status(500).json({
        erro: "Erro ao remover projeto",
      });
    }
  },
};

module.exports = projetosController;

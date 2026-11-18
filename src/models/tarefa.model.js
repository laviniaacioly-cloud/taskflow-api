
const prisma = require("../database/prisma");
const formatarTarefa = require("../../utils/formatarTarefa");
const criarErro = require("../../utils/criarErro");

const incluirNomes = {
  projetos: {
    select: { nome: true },
  },
  usuario: {
    select: { nome: true },
  },
  prioridades: {
    select: { descricao: true, cor: true },
  },
};

const tarefaModel = {
  // LISTAR TAREFAS DO USUÁRIO
  listarPorUsuario: async (usuarioId) => {
    const result = await prisma.tarefas.findMany({
      where: {
        usuario_id: Number(usuarioId),
      },
      include: incluirNomes,
      orderBy: {
        id: "asc",
      },
    });

    return result.map(formatarTarefa);
  },

  // BUSCAR TAREFA DO USUÁRIO
  buscar: async (id, usuarioId) => {
    const tarefa = await prisma.tarefas.findFirst({
      where: {
        id: Number(id),
        usuario_id: Number(usuarioId),
      },
      include: incluirNomes,
    });

    return tarefa ? formatarTarefa(tarefa) : null;
  },


  // LISTAR TODAS AS TAREFAS
  // Compatibilidade temporária com o controller de projetos
  listar: async () => {
    const result = await prisma.tarefas.findMany({
      include: incluirNomes,
      orderBy: {
        id: "asc",
      },
    });

    return result.map(formatarTarefa);
  },


  // VERIFICAR SE O PROJETO PERTENCE AO USUÁRIO
  verificarProjeto: async (projetoId, usuarioId) => {
    const projeto = await prisma.projetos.findFirst({
      where: {
        id: Number(projetoId),
        usuario_id: Number(usuarioId),
      },
    });

    if (!projeto) {
      throw criarErro(
        403,
        "Projeto não encontrado ou não pertence ao usuário logado.",
      );
    }

    return projeto;
  },

  // ADICIONAR TAREFA
  adicionar: async ({
    texto,
    prioridade_id,
    prioridade,
    coluna,
    usuarioId,
    projetoId,
    ordem,
  }) => {
    const usuarioIdFinal = Number(usuarioId);
    const projetoIdFinal = Number(projetoId);

    await tarefaModel.verificarProjeto(
      projetoIdFinal,
      usuarioIdFinal,
    );

    const prioridadesIds = {
      baixa: 1,
      media: 2,
      alta: 3,
    };

    const prioridadeId =
      prioridade_id ?? prioridadesIds[prioridade || "media"];

    if (!prioridadeId) {
      throw criarErro(400, "Prioridade inválida.");
    }

    const colunaFinal = coluna || "afazer";
    const agora = new Date();

    const iniciadaEm =
      colunaFinal === "andamento" || colunaFinal === "concluido"
        ? agora
        : null;

    const concluidaEm =
      colunaFinal === "concluido" ? agora : null;

    const tarefa = await prisma.tarefas.create({
      data: {
        texto,
        coluna: colunaFinal,
        ordem: Number(ordem ?? 0),
        iniciada_em: iniciadaEm,
        concluida_em: concluidaEm,
        prioridades: {
          connect: {
            id: Number(prioridadeId),
          },
        },
        usuario: {
          connect: {
            id: usuarioIdFinal,
          },
        },
        projetos: {
          connect: {
            id: projetoIdFinal,
          },
        },
      },
      include: incluirNomes,
    });

    return formatarTarefa(tarefa);
  },

  // ATUALIZAR TAREFA
  atualizar: async (id, usuarioId, dados) => {
    const idNumerico = Number(id);
    const usuarioIdNumerico = Number(usuarioId);

    const atual = await prisma.tarefas.findFirst({
      where: {
        id: idNumerico,
        usuario_id: usuarioIdNumerico,
      },
    });

    if (!atual) return null;

    // Impede associar tarefa a projeto de outro usuário
    if (dados.projeto_id !== undefined) {
      await tarefaModel.verificarProjeto(
        dados.projeto_id,
        usuarioIdNumerico,
      );
    }

    const prioridadesIds = {
      baixa: 1,
      media: 2,
      alta: 3,
    };

    const prioridadeId =
      dados.prioridade_id ??
      (dados.prioridade !== undefined
        ? prioridadesIds[dados.prioridade]
        : undefined);

    if (
      dados.prioridade !== undefined &&
      prioridadeId === undefined
    ) {
      throw criarErro(400, "Prioridade inválida.");
    }

    const novaColuna = dados.coluna ?? atual.coluna;

    let iniciadaEm = atual.iniciada_em;

    if (
      novaColuna === "andamento" &&
      !iniciadaEm
    ) {
      iniciadaEm = new Date();
    }

    let concluidaEm = atual.concluida_em;

    if (novaColuna === "concluido") {
      if (!concluidaEm) {
        concluidaEm = new Date();
      }
    } else {
      concluidaEm = null;
    }

    const dadosAtualizados = {
      texto: dados.texto ?? atual.texto,
      prioridade_id:
        prioridadeId !== undefined
          ? Number(prioridadeId)
          : atual.prioridade_id,
      coluna: novaColuna,
      projeto_id:
        dados.projeto_id !== undefined
          ? Number(dados.projeto_id)
          : atual.projeto_id,
      ordem:
        dados.ordem !== undefined
          ? Number(dados.ordem)
          : atual.ordem,
      iniciada_em: iniciadaEm,
      concluida_em: concluidaEm,
    };

    const tarefa = await prisma.tarefas.update({
      where: {
        id: idNumerico,
      },
      data: dadosAtualizados,
      include: incluirNomes,
    });

    return formatarTarefa(tarefa);
  },

  // EXCLUIR TAREFA
  remover: async (id, usuarioId) => {
    const idNumerico = Number(id);
    const usuarioIdNumerico = Number(usuarioId);

    const tarefa = await prisma.tarefas.findFirst({
      where: {
        id: idNumerico,
        usuario_id: usuarioIdNumerico,
      },
    });

    if (!tarefa) return null;

    return await prisma.tarefas.delete({
      where: {
        id: idNumerico,
      },
    });
  },

  // ESTATÍSTICAS DO USUÁRIO
  estatisticas: async (usuarioId) => {
    const tarefas = await prisma.tarefas.findMany({
      where: {
        usuario_id: Number(usuarioId),
      },
      select: {
        coluna: true,
        prioridades: {
          select: {
            descricao: true,
          },
        },
      },
    });

    const total = tarefas.length;

    const porColuna = {
      afazer: tarefas.filter((t) => t.coluna === "afazer").length,
      andamento: tarefas.filter((t) => t.coluna === "andamento").length,
      concluido: tarefas.filter((t) => t.coluna === "concluido").length,
    };

    const porPrioridade = {
      alta: tarefas.filter(
        (t) => t.prioridades?.descricao === "alta",
      ).length,
      media: tarefas.filter(
        (t) => t.prioridades?.descricao === "media",
      ).length,
      baixa: tarefas.filter(
        (t) => t.prioridades?.descricao === "baixa",
      ).length,
    };

    const comMaisTarefas = Object.entries(porColuna).sort(
      (a, b) => b[1] - a[1],
    );

    return {
      total,
      porColuna,
      porPrioridade,
      "Mais Tarefas": comMaisTarefas,
    };
  },

  // RESUMO DO USUÁRIO
  resumo: async (usuarioId) => {
    const tarefas = await prisma.tarefas.findMany({
      where: {
        usuario_id: Number(usuarioId),
      },
      select: {
        coluna: true,
        prioridades: {
          select: {
            descricao: true,
          },
        },
      },
    });

    const total = tarefas.length;

    const afazer = tarefas.filter(
      (t) => t.coluna === "afazer",
    ).length;

    const andamento = tarefas.filter(
      (t) => t.coluna === "andamento",
    ).length;

    const concluido = tarefas.filter(
      (t) => t.coluna === "concluido",
    ).length;

    const prioridades = {
      alta: tarefas.filter(
        (t) => t.prioridades?.descricao === "alta",
      ).length,
      media: tarefas.filter(
        (t) => t.prioridades?.descricao === "media",
      ).length,
      baixa: tarefas.filter(
        (t) => t.prioridades?.descricao === "baixa",
      ).length,
    };

    const prioridadeMaisComum =
      total === 0
        ? "nenhuma"
        : Object.entries(prioridades).sort(
            (a, b) => b[1] - a[1],
          )[0][0];

    return `Você tem ${total} tarefa(s): ${concluido} concluída(s), ${andamento} em andamento e ${afazer} a fazer. A prioridade mais comum: ${prioridadeMaisComum}.`;
  },
};

module.exports = tarefaModel;

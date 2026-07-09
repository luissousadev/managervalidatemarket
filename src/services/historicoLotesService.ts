import { supabase } from "./supabaseClient";

const TABELA = "lotes_historico";

export type HistoricoLote = {
  id: number;
  loteId: number;
  codigoLote: string;
  nomeProduto: string;
  nomeColaborador: string;
  ultimaAtualizacao: string;
  estoqueAnterior: number;
  estoqueAtual: number;
};

type HistoricoLinha = {
  id: number;
  lote_id: number;
  ultima_atualizacao: string;
  estoque_anterior: number;
  estoque_atual: number;
  lotes: {
    codigo: string;
    usuarios: { nome: string } | null;
    produtos: { descricao: string } | null;
  } | null;
};

function paraHistorico(linha: HistoricoLinha): HistoricoLote {
  return {
    id: linha.id,
    loteId: linha.lote_id,
    codigoLote: linha.lotes?.codigo ?? "",
    nomeProduto: linha.lotes?.produtos?.descricao ?? "—",
    nomeColaborador: linha.lotes?.usuarios?.nome ?? "—",
    ultimaAtualizacao: linha.ultima_atualizacao,
    estoqueAnterior: linha.estoque_anterior,
    estoqueAtual: linha.estoque_atual,
  };
}

export async function listarHistoricoLotes(): Promise<HistoricoLote[]> {
  const TAMANHO_PAGINA = 1000;
  const todos: HistoricoLote[] = [];

  for (let inicio = 0; ; inicio += TAMANHO_PAGINA) {
    const { data, error } = await supabase
      .from(TABELA)
      .select(
        "id, lote_id, ultima_atualizacao, estoque_anterior, estoque_atual, lotes (codigo, usuarios (nome), produtos (descricao))"
      )
      .order("ultima_atualizacao", { ascending: false })
      .range(inicio, inicio + TAMANHO_PAGINA - 1);

    if (error) {
      throw new Error(`Erro ao listar histórico de lotes: ${error.message}`);
    }

    const pagina = (data ?? []) as unknown as HistoricoLinha[];
    todos.push(...pagina.map(paraHistorico));
    if (pagina.length < TAMANHO_PAGINA) break;
  }

  return todos;
}

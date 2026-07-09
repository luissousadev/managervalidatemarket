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
    usuario_id: number | null;
    produtos: { descricao: string } | null;
  } | null;
};

type UsuarioLinha = {
  id: number;
  nome: string;
};

async function mapaNomesUsuarios(): Promise<Map<number, string>> {
  const { data, error } = await supabase.rpc("listar_usuarios");

  if (error) {
    throw new Error(`Erro ao listar usuários: ${error.message}`);
  }

  const mapa = new Map<number, string>();
  for (const usuario of (data ?? []) as UsuarioLinha[]) {
    mapa.set(Number(usuario.id), usuario.nome);
  }
  return mapa;
}

function paraHistorico(
  linha: HistoricoLinha,
  nomesUsuarios: Map<number, string>
): HistoricoLote {
  const usuarioId = linha.lotes?.usuario_id;
  const nomeColaborador =
    usuarioId != null ? (nomesUsuarios.get(usuarioId) ?? "—") : "—";

  return {
    id: linha.id,
    loteId: linha.lote_id,
    codigoLote: linha.lotes?.codigo ?? "",
    nomeProduto: linha.lotes?.produtos?.descricao ?? "—",
    nomeColaborador,
    ultimaAtualizacao: linha.ultima_atualizacao,
    estoqueAnterior: linha.estoque_anterior,
    estoqueAtual: linha.estoque_atual,
  };
}

export async function listarHistoricoLotes(): Promise<HistoricoLote[]> {
  const nomesUsuarios = await mapaNomesUsuarios();
  const TAMANHO_PAGINA = 1000;
  const todos: HistoricoLote[] = [];

  for (let inicio = 0; ; inicio += TAMANHO_PAGINA) {
    const { data, error } = await supabase
      .from(TABELA)
      .select(
        "id, lote_id, ultima_atualizacao, estoque_anterior, estoque_atual, lotes (codigo, usuario_id, produtos (descricao))"
      )
      .order("ultima_atualizacao", { ascending: false })
      .range(inicio, inicio + TAMANHO_PAGINA - 1);

    if (error) {
      throw new Error(`Erro ao listar histórico de lotes: ${error.message}`);
    }

    const pagina = (data ?? []) as unknown as HistoricoLinha[];
    todos.push(...pagina.map((linha) => paraHistorico(linha, nomesUsuarios)));
    if (pagina.length < TAMANHO_PAGINA) break;
  }

  return todos;
}

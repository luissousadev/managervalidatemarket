import { supabase } from "./supabaseClient";

// Tabela "lotes" no Supabase:
//   id         bigint (identity, primary key)
//   codigo     text  (gerado pelo banco: L0001, L0002...)
//   produto_id bigint (referencia produtos.id)
//   quantidade integer (>= 0)
//   validade   date
//   last_update timestamptz (default now(), atualizado por trigger no banco)
const TABELA = "lotes";
const COLUNAS =
  "id, codigo, produto_id, quantidade, validade, last_update, produtos (descricao, codigo_barras)";

export type Lote = {
  id: number;
  codigo: string;
  produtoId: number;
  quantidade: number;
  validade: string; // ISO yyyy-mm-dd
  lastUpdate: string; // ISO timestamp da última alteração
  descricao: string; // do produto vinculado
  codigoBarras: string; // do produto vinculado
};

export type NovoLote = {
  produtoId: number;
  quantidade: number;
  validade: string;
};

type LoteLinha = {
  id: number;
  codigo: string;
  produto_id: number;
  quantidade: number;
  validade: string;
  last_update: string;
  produtos: { descricao: string; codigo_barras: string } | null;
};

function paraLote(linha: LoteLinha): Lote {
  return {
    id: linha.id,
    codigo: linha.codigo,
    produtoId: linha.produto_id,
    quantidade: linha.quantidade,
    validade: linha.validade,
    lastUpdate: linha.last_update,
    descricao: linha.produtos?.descricao ?? "",
    codigoBarras: linha.produtos?.codigo_barras ?? "",
  };
}

export async function listarLotes(): Promise<Lote[]> {
  // mesma paginação dos produtos: o Supabase devolve no máximo 1000 linhas
  const TAMANHO_PAGINA = 1000;
  const todos: Lote[] = [];

  for (let inicio = 0; ; inicio += TAMANHO_PAGINA) {
    const { data, error } = await supabase
      .from(TABELA)
      .select(COLUNAS)
      .order("validade", { ascending: true })
      .range(inicio, inicio + TAMANHO_PAGINA - 1);

    if (error) throw new Error(`Erro ao listar lotes: ${error.message}`);
    const pagina = (data ?? []) as unknown as LoteLinha[];
    todos.push(...pagina.map(paraLote));
    if (pagina.length < TAMANHO_PAGINA) break;
  }

  return todos;
}

export async function buscarLotePorId(id: number): Promise<Lote | null> {
  const { data, error } = await supabase
    .from(TABELA)
    .select(COLUNAS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar lote: ${error.message}`);
  return data ? paraLote(data as unknown as LoteLinha) : null;
}

export async function criarLote(lote: NovoLote): Promise<Lote> {
  const { data, error } = await supabase
    .from(TABELA)
    .insert({
      produto_id: lote.produtoId,
      quantidade: lote.quantidade,
      validade: lote.validade,
    })
    .select(COLUNAS)
    .single();

  if (error) throw new Error(`Erro ao criar lote: ${error.message}`);
  return paraLote(data as unknown as LoteLinha);
}

export async function atualizarLote(
  id: number,
  dados: { quantidade: number; validade: string }
): Promise<Lote> {
  const { data, error } = await supabase
    .from(TABELA)
    .update({ quantidade: dados.quantidade, validade: dados.validade })
    .eq("id", id)
    .select(COLUNAS)
    .single();

  if (error) throw new Error(`Erro ao atualizar lote: ${error.message}`);
  return paraLote(data as unknown as LoteLinha);
}

export async function excluirLote(id: number): Promise<void> {
  const { error } = await supabase.from(TABELA).delete().eq("id", id);

  if (error) throw new Error(`Erro ao excluir lote: ${error.message}`);
}

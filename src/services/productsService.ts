import { supabase } from "./supabaseClient";

// Tabela "produtos" no Supabase:
//   id            bigint (identity, primary key)
//   descricao     text
//   codigo_barras text
const TABELA = "produtos";

export type Produto = {
  id: number;
  descricao: string;
  codigoBarras: string;
};

export type NovoProduto = Omit<Produto, "id">;

type ProdutoLinha = {
  id: number;
  descricao: string;
  codigo_barras: string;
};

function paraProduto(linha: ProdutoLinha): Produto {
  return {
    id: linha.id,
    descricao: linha.descricao,
    codigoBarras: linha.codigo_barras,
  };
}

function paraLinha(produto: NovoProduto) {
  return {
    descricao: produto.descricao,
    codigo_barras: produto.codigoBarras,
  };
}

function traduzirErro(prefixo: string, mensagem: string) {
  if (mensagem.includes("duplicate key")) {
    return new Error("Já existe um produto com este código de barras.");
  }
  return new Error(`${prefixo}: ${mensagem}`);
}

export async function listarProdutos(): Promise<Produto[]> {
  // O Supabase devolve no máximo 1000 linhas por consulta,
  // então a listagem é feita em páginas até buscar tudo.
  const TAMANHO_PAGINA = 1000;
  const todos: Produto[] = [];

  for (let inicio = 0; ; inicio += TAMANHO_PAGINA) {
    const { data, error } = await supabase
      .from(TABELA)
      .select("id, descricao, codigo_barras")
      .order("descricao", { ascending: true })
      .range(inicio, inicio + TAMANHO_PAGINA - 1);

    if (error) throw new Error(`Erro ao listar produtos: ${error.message}`);
    const pagina = data ?? [];
    todos.push(...pagina.map(paraProduto));
    if (pagina.length < TAMANHO_PAGINA) break;
  }

  return todos;
}

// Lista produtos cujo código de barras começa com o prefixo digitado
// (autocomplete da tela de novo lote).
export async function pesquisarProdutosPorCodigoBarras(
  prefixo: string,
  limite = 8
): Promise<Produto[]> {
  const prefixoLimpo = prefixo.replace(/[%_]/g, "");
  const { data, error } = await supabase
    .from(TABELA)
    .select("id, descricao, codigo_barras")
    .like("codigo_barras", `${prefixoLimpo}%`)
    .order("codigo_barras", { ascending: true })
    .limit(limite);

  if (error) throw new Error(`Erro ao pesquisar produtos: ${error.message}`);
  return (data ?? []).map(paraProduto);
}

export async function buscarProdutoPorCodigoBarras(
  codigoBarras: string
): Promise<Produto | null> {
  const { data, error } = await supabase
    .from(TABELA)
    .select("id, descricao, codigo_barras")
    .eq("codigo_barras", codigoBarras)
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar produto: ${error.message}`);
  return data ? paraProduto(data) : null;
}

export async function buscarProdutoPorId(id: number): Promise<Produto | null> {
  const { data, error } = await supabase
    .from(TABELA)
    .select("id, descricao, codigo_barras")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar produto: ${error.message}`);
  return data ? paraProduto(data) : null;
}

export async function criarProduto(produto: NovoProduto): Promise<Produto> {
  const { data, error } = await supabase
    .from(TABELA)
    .insert(paraLinha(produto))
    .select("id, descricao, codigo_barras")
    .single();

  if (error) throw traduzirErro("Erro ao criar produto", error.message);
  return paraProduto(data);
}

export async function atualizarProduto(
  id: number,
  produto: NovoProduto
): Promise<Produto> {
  const { data, error } = await supabase
    .from(TABELA)
    .update(paraLinha(produto))
    .eq("id", id)
    .select("id, descricao, codigo_barras")
    .single();

  if (error) throw traduzirErro("Erro ao atualizar produto", error.message);
  return paraProduto(data);
}

export async function excluirProduto(id: number): Promise<void> {
  const { error } = await supabase.from(TABELA).delete().eq("id", id);

  if (error) throw new Error(`Erro ao excluir produto: ${error.message}`);
}

// Importação em massa (planilha), em lotes para não estourar o limite de
// payload. Produto com código de barras já cadastrado é substituído pelo
// da planilha (upsert) — nada fica duplicado.
export async function importarProdutos(
  produtos: NovoProduto[]
): Promise<number> {
  // se a própria planilha repetir um código, vale a última ocorrência
  const porCodigo = new Map<string, NovoProduto>();
  for (const produto of produtos) {
    porCodigo.set(produto.codigoBarras, produto);
  }
  const unicos = [...porCodigo.values()];

  const TAMANHO_LOTE = 500;
  let gravados = 0;

  for (let i = 0; i < unicos.length; i += TAMANHO_LOTE) {
    const lote = unicos.slice(i, i + TAMANHO_LOTE).map(paraLinha);
    const { error, count } = await supabase
      .from(TABELA)
      .upsert(lote, { onConflict: "codigo_barras", count: "exact" });

    if (error) {
      throw new Error(
        `Erro ao importar produtos (a partir do item ${i + 1}): ${error.message}`
      );
    }
    gravados += count ?? lote.length;
  }

  return gravados;
}

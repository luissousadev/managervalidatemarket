"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type Produto,
  pesquisarProdutosPorCodigoBarras,
} from "@/services/productsService";
import { criarLote } from "@/services/lotesService";
import styles from "./page.module.css";

const MINIMO_BUSCA = 3;

export default function NovoLote() {
  const router = useRouter();
  const [codigoBusca, setCodigoBusca] = useState("");
  const [resultadoBusca, setResultadoBusca] = useState<{
    termo: string;
    produtos: Produto[];
  } | null>(null);
  const [selecionado, setSelecionado] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState("");
  const [validade, setValidade] = useState("");
  const [salvando, setSalvando] = useState(false);

  const termo = codigoBusca.trim();

  // pesquisa produtos que começam com o código digitado (com debounce)
  useEffect(() => {
    if (termo.length < MINIMO_BUSCA) return;
    let ativo = true;
    const timer = setTimeout(() => {
      pesquisarProdutosPorCodigoBarras(termo)
        .then((produtos) => {
          if (ativo) setResultadoBusca({ termo, produtos });
        })
        .catch((erro) => {
          console.error(erro);
          if (ativo) setResultadoBusca({ termo, produtos: [] });
        });
    }, 300);
    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [termo]);

  const buscaAtual =
    termo.length >= MINIMO_BUSCA && resultadoBusca?.termo === termo
      ? resultadoBusca
      : null;

  // vinculado quando: escolhido na lista, ou o código digitado bate exato
  const produtoVinculado =
    selecionado && selecionado.codigoBarras === termo
      ? selecionado
      : buscaAtual?.produtos.find(
          (produto) => produto.codigoBarras === termo
        ) ?? null;

  const sugestoes =
    !produtoVinculado && buscaAtual ? buscaAtual.produtos : [];
  const naoEncontrado = buscaAtual !== null && buscaAtual.produtos.length === 0;

  function escolherProduto(produto: Produto) {
    setSelecionado(produto);
    setCodigoBusca(produto.codigoBarras);
  }

  async function cadastrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!produtoVinculado) return;

    const qtde = Number(quantidade);
    if (!Number.isInteger(qtde) || qtde < 0) {
      alert("Informe uma quantidade válida (número inteiro, zero ou maior).");
      return;
    }
    if (!validade) {
      alert("Informe a data de validade.");
      return;
    }

    setSalvando(true);
    try {
      await criarLote({ produtoId: produtoVinculado.id, quantidade: qtde, validade });
      router.push("/lotes");
    } catch (erro) {
      console.error(erro);
      alert(erro instanceof Error ? erro.message : "Erro ao cadastrar o lote.");
      setSalvando(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.phone}>
        <main className={styles.screen}>
          <button
            type="button"
            className={styles.voltar}
            aria-label="Voltar"
            onClick={() => router.back()}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className={styles.title}>Novo Lote</h1>
          <p className={styles.subtitle}>
            Informe os dados do lote para cadastrar
          </p>

          <form className={styles.form} onSubmit={cadastrar}>
            <label className={styles.label} htmlFor="codigo">
              Código do lote
            </label>
            <div className={`${styles.inputWrap} ${styles.bloqueado}`}>
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <input
                className={styles.input}
                id="codigo"
                type="text"
                disabled
                placeholder="Gerado automaticamente pelo sistema"
              />
            </div>

            <label className={styles.label} htmlFor="codigoBarras">
              Produto (código de barras)
            </label>
            <div className={styles.inputWrap}>
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                className={styles.input}
                id="codigoBarras"
                type="search"
                inputMode="numeric"
                placeholder="Pesquisar pelo código de barras"
                value={codigoBusca}
                onChange={(evento) => setCodigoBusca(evento.target.value)}
              />
            </div>

            {sugestoes.length > 0 && (
              <div className={styles.sugestoes}>
                {sugestoes.map((produto) => (
                  <button
                    key={produto.id}
                    type="button"
                    className={styles.sugestaoItem}
                    onClick={() => escolherProduto(produto)}
                  >
                    <span className={styles.produtoNome}>
                      {produto.descricao}
                    </span>
                    <span className={styles.produtoCodigo}>
                      {produto.codigoBarras}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {produtoVinculado && (
              <div className={styles.produtoVinculado}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <div>
                  <span className={styles.produtoNome}>
                    {produtoVinculado.descricao}
                  </span>
                  <span className={styles.produtoCodigo}>
                    {produtoVinculado.codigoBarras}
                  </span>
                </div>
              </div>
            )}

            {naoEncontrado && (
              <p className={styles.naoEncontrado}>
                Nenhum produto encontrado com esse código de barras
              </p>
            )}

            <label className={styles.label} htmlFor="quantidade">
              Quantidade
            </label>
            <div className={styles.inputWrap}>
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <input
                className={styles.input}
                id="quantidade"
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="Ex.: 12"
                value={quantidade}
                onChange={(evento) => setQuantidade(evento.target.value)}
              />
            </div>

            <label className={styles.label} htmlFor="validade">
              Validade
            </label>
            <div className={styles.inputWrap}>
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M8 3v4" />
                <path d="M16 3v4" />
                <path d="M3 11h18" />
              </svg>
              <input
                className={styles.input}
                id="validade"
                type="date"
                value={validade}
                onChange={(evento) => setValidade(evento.target.value)}
              />
            </div>

            <button
              className={styles.button}
              type="submit"
              disabled={!produtoVinculado || salvando}
            >
              {salvando ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

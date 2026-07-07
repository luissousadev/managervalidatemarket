"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import MenuSuperior from "@/components/MenuSuperior";
import {
  type NovoProduto,
  type Produto,
  excluirProduto as excluirProdutoNoBanco,
  importarProdutos,
  listarProdutos,
} from "@/services/productsService";
import styles from "./page.module.css";

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

function celulaParaTexto(valor: unknown) {
  if (valor === null || valor === undefined) return "";
  if (typeof valor === "number") return String(Math.trunc(valor));
  return String(valor).trim();
}

function lerProdutosDaPlanilha(dados: ArrayBuffer): NovoProduto[] {
  const planilha = XLSX.read(dados, { type: "array" });
  const aba = planilha.Sheets[planilha.SheetNames[0]];
  const linhas = XLSX.utils.sheet_to_json<unknown[]>(aba, {
    header: 1,
    defval: "",
  });

  // Localiza a linha de cabeçalho ("Codigo de Barras" / "Descrição")
  let colunaCodigo = 0;
  let colunaDescricao = 1;
  let inicioDados = 0;
  for (let i = 0; i < linhas.length; i++) {
    const celulas = linhas[i].map((celula) =>
      normalizarTexto(celulaParaTexto(celula))
    );
    const posCodigo = celulas.findIndex((texto) =>
      texto.includes("codigo de barras")
    );
    const posDescricao = celulas.findIndex((texto) =>
      texto.includes("descricao")
    );
    if (posCodigo !== -1 && posDescricao !== -1) {
      colunaCodigo = posCodigo;
      colunaDescricao = posDescricao;
      inicioDados = i + 1;
      break;
    }
  }

  const produtos: NovoProduto[] = [];
  for (let i = inicioDados; i < linhas.length; i++) {
    const codigoBarras = celulaParaTexto(linhas[i][colunaCodigo]);
    const descricao = celulaParaTexto(linhas[i][colunaDescricao]);
    if (!codigoBarras && !descricao) continue;
    produtos.push({ descricao, codigoBarras });
  }
  return produtos;
}

export default function Produtos() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregar, setErroCarregar] = useState(false);
  const [busca, setBusca] = useState("");
  const [importando, setImportando] = useState(false);
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ativo = true;
    listarProdutos()
      .then((lista) => {
        if (ativo) setProdutos(lista);
      })
      .catch((erro) => {
        console.error(erro);
        if (ativo) setErroCarregar(true);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function importarPlanilha(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;

    setImportando(true);
    try {
      // dá tempo do modal aparecer antes do processamento pesado
      await new Promise((resolve) => setTimeout(resolve, 80));
      const dados = await arquivo.arrayBuffer();
      const importados = lerProdutosDaPlanilha(dados);
      if (importados.length === 0) {
        alert("Nenhum produto encontrado na planilha.");
        return;
      }
      await importarProdutos(importados);
      const lista = await listarProdutos();
      setProdutos(lista);
      // mantém o modal até a lista terminar de renderizar
      await new Promise((resolve) => setTimeout(resolve, 150));
    } catch (erro) {
      console.error(erro);
      alert(
        erro instanceof Error
          ? erro.message
          : "Não foi possível importar a planilha. Verifique o arquivo .xlsx."
      );
    } finally {
      setImportando(false);
    }
  }

  const termo = busca.trim().toLowerCase();
  const produtosFiltrados = termo
    ? produtos.filter(
        (produto) =>
          produto.descricao.toLowerCase().includes(termo) ||
          produto.codigoBarras.includes(termo)
      )
    : produtos;

  function editarProduto(id: number) {
    router.push(`/produtos/novo-produto?id=${id}`);
  }

  async function excluirProduto(id: number) {
    const produto = produtos.find((item) => item.id === id);
    if (!confirm(`Excluir "${produto?.descricao ?? "produto"}"?`)) return;
    try {
      await excluirProdutoNoBanco(id);
      setProdutos((lista) => lista.filter((item) => item.id !== id));
    } catch (erro) {
      console.error(erro);
      alert("Erro ao excluir o produto.");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.phone}>
        <main className={styles.screen}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>Produtos</h1>
              <p className={styles.subtitle}>Produtos cadastrados no sistema</p>
            </div>
            <MenuSuperior />
          </header>

          <input
            ref={inputArquivoRef}
            type="file"
            accept=".xlsx"
            hidden
            onChange={importarPlanilha}
          />

          <button
            type="button"
            className={styles.botaoImportar}
            disabled={importando}
            onClick={() => inputArquivoRef.current?.click()}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v12" />
              <path d="M7 8l5-5 5 5" />
              <path d="M4 21h16" />
            </svg>
            {importando ? "Importando..." : "Importar planilha"}
          </button>

          <Link href="/produtos/novo-produto" className={styles.botaoNovo}>
            + Novo produto
          </Link>

          <div className={styles.buscaWrap}>
            <svg
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
              className={styles.busca}
              type="search"
              placeholder="Pesquisar por nome ou código de barras"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </div>

          {carregando ? (
            <p className={styles.subtitle}>Carregando produtos...</p>
          ) : erroCarregar ? (
            <p className={styles.subtitle}>
              Erro ao carregar os produtos do banco. Verifique a conexão e
              recarregue a página.
            </p>
          ) : produtosFiltrados.length === 0 ? (
            <p className={styles.subtitle}>
              {termo
                ? "Nenhum produto encontrado na pesquisa."
                : "Nenhum produto cadastrado ainda."}
            </p>
          ) : (
            <ul className={styles.lista}>
              {produtosFiltrados.map((produto) => (
                <li key={produto.id} className={styles.card}>
                  <div className={styles.info}>
                    <span className={styles.descricao}>{produto.descricao}</span>
                    <span className={styles.codigo}>{produto.codigoBarras}</span>
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.acaoEditar}
                      aria-label={`Editar ${produto.descricao}`}
                      onClick={() => editarProduto(produto.id)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={styles.acaoExcluir}
                      aria-label={`Excluir ${produto.descricao}`}
                      onClick={() => excluirProduto(produto.id)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {importando && (
            <div className={styles.modalOverlay} role="alert" aria-busy="true">
              <div className={styles.modalCard}>
                <div className={styles.spinner} />
                <p className={styles.modalMensagem}>
                  Por favor, aguardem enquanto os produtos do arquivo estão
                  sendo importados pelo sistema.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

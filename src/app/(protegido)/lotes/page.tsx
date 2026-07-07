"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MenuSuperior from "@/components/MenuSuperior";
import {
  type Lote,
  excluirLote as excluirLoteNoBanco,
  listarLotes,
} from "@/services/lotesService";
import * as XLSX from "xlsx";
import styles from "./page.module.css";

function formatarData(validade: string): string {
  const [ano, mes, dia] = validade.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function Lotes() {
  const router = useRouter();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregar, setErroCarregar] = useState(false);
  const [periodoInicial, setPeriodoInicial] = useState("");
  const [periodoFinal, setPeriodoFinal] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    let ativo = true;
    listarLotes()
      .then((lista) => {
        if (ativo) setLotes(lista);
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

  const termoBusca = busca.trim();
  const lotesFiltrados = lotes.filter(
    (lote) =>
      (!periodoInicial || lote.validade >= periodoInicial) &&
      (!periodoFinal || lote.validade <= periodoFinal) &&
      (!termoBusca || lote.codigoBarras.includes(termoBusca))
  );

  function exportarExcel() {
    const linhas = lotesFiltrados.map((lote) => ({
      Lote: lote.codigo,
      Produto: lote.descricao,
      "Código de barras": lote.codigoBarras,
      Quantidade: lote.quantidade,
      Validade: formatarData(lote.validade),
    }));
    const planilha = XLSX.utils.json_to_sheet(linhas);
    const arquivo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(arquivo, planilha, "Lotes");
    const agora = new Date();
    const dois = (valor: number) => String(valor).padStart(2, "0");
    const nomeArquivo = `lotes_${dois(agora.getDate())}${dois(
      agora.getMonth() + 1
    )}${agora.getFullYear()}_${dois(agora.getHours())}${dois(
      agora.getMinutes()
    )}${dois(agora.getSeconds())}.xlsx`;
    XLSX.writeFile(arquivo, nomeArquivo);
  }

  function editarLote(id: number) {
    router.push(`/lotes/editar-lote?id=${id}`);
  }

  async function excluirLote(id: number) {
    const lote = lotes.find((item) => item.id === id);
    if (!confirm(`Excluir o lote ${lote?.codigo ?? ""} (${lote?.descricao ?? "produto"})?`)) {
      return;
    }
    try {
      await excluirLoteNoBanco(id);
      setLotes((lista) => lista.filter((item) => item.id !== id));
    } catch (erro) {
      console.error(erro);
      alert("Erro ao excluir o lote.");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.phone}>
        <main className={styles.screen}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>Lotes</h1>
              <p className={styles.subtitle}>Lotes de produtos cadastrados</p>
            </div>
            <MenuSuperior />
          </header>

          <Link href="/lotes/novo-lote" className={styles.botaoNovo}>
            + Novo lote
          </Link>

          <div className={styles.filtros}>
            <div className={styles.filtroCampo}>
              <label className={styles.filtroLabel} htmlFor="periodoInicial">
                Período inicial
              </label>
              <input
                className={styles.filtroData}
                id="periodoInicial"
                type="date"
                value={periodoInicial}
                onChange={(evento) => setPeriodoInicial(evento.target.value)}
              />
            </div>
            <div className={styles.filtroCampo}>
              <label className={styles.filtroLabel} htmlFor="periodoFinal">
                Período final
              </label>
              <input
                className={styles.filtroData}
                id="periodoFinal"
                type="date"
                value={periodoFinal}
                onChange={(evento) => setPeriodoFinal(evento.target.value)}
              />
            </div>
          </div>

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
              inputMode="numeric"
              placeholder="Pesquisar pelo código de barras do produto"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </div>

          <button
            type="button"
            className={styles.botaoExportar}
            onClick={exportarExcel}
            disabled={carregando || lotesFiltrados.length === 0}
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
              <path d="M7 10l5 5 5-5" />
              <path d="M4 21h16" />
            </svg>
            Exportar Excel
          </button>

          {carregando ? (
            <p className={styles.subtitle}>Carregando lotes...</p>
          ) : erroCarregar ? (
            <p className={styles.subtitle}>
              Erro ao carregar os lotes do banco. Verifique a conexão e
              recarregue a página.
            </p>
          ) : lotesFiltrados.length === 0 ? (
            <p className={styles.subtitle}>
              {periodoInicial || periodoFinal || termoBusca
                ? "Nenhum lote encontrado na pesquisa."
                : "Nenhum lote cadastrado ainda."}
            </p>
          ) : (
          <ul className={styles.lista}>
            {lotesFiltrados.map((lote) => (
              <li key={lote.id} className={styles.card}>
                <div className={styles.linhaTopo}>
                  <div className={styles.produtoInfo}>
                    <span className={styles.descricao}>{lote.descricao}</span>
                    <span className={styles.codigoBarras}>
                      {lote.codigoBarras}
                    </span>
                  </div>
                  <span className={styles.codigo}>{lote.codigo}</span>
                </div>
                <div className={styles.linhaBaixo}>
                  <div className={styles.detalhes}>
                    <div className={styles.detalheCampo}>
                      <span className={styles.detalheRotulo}>Qtde:</span>
                      <span className={styles.detalheValor}>
                        {lote.quantidade} un
                      </span>
                    </div>
                    <div className={styles.detalheCampo}>
                      <span className={styles.detalheRotulo}>Validade:</span>
                      <span className={styles.detalheValor}>
                        {formatarData(lote.validade)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.acaoEditar}
                    aria-label={`Editar lote ${lote.codigo}`}
                    onClick={() => editarLote(lote.id)}
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
                    aria-label={`Excluir lote ${lote.codigo}`}
                    onClick={() => excluirLote(lote.id)}
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
                </div>
              </li>
            ))}
          </ul>
          )}
        </main>
      </div>
    </div>
  );
}

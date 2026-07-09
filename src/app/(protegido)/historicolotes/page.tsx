"use client";

import { useEffect, useState } from "react";
import MenuSuperior from "@/components/MenuSuperior";
import {
  type HistoricoLote,
  listarHistoricoLotes,
} from "@/services/historicoLotesService";
import styles from "./page.module.css";

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

export default function HistoricoLotes() {
  const [historico, setHistorico] = useState<HistoricoLote[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregar, setErroCarregar] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    let ativo = true;
    listarHistoricoLotes()
      .then((lista) => {
        if (ativo) setHistorico(lista);
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

  const termo = busca.trim().toLowerCase();
  const historicoFiltrado = termo
    ? historico.filter(
        (item) =>
          String(item.loteId).includes(termo) ||
          item.codigoLote.toLowerCase().includes(termo) ||
          item.nomeProduto.toLowerCase().includes(termo) ||
          item.nomeColaborador.toLowerCase().includes(termo)
      )
    : historico;

  return (
    <div className={styles.page}>
      <div className={styles.phone}>
        <main className={styles.screen}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>Histórico Lotes</h1>
              <p className={styles.subtitle}>
                Movimentações de estoque dos lotes
              </p>
            </div>
            <MenuSuperior />
          </header>

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
              inputMode="search"
              placeholder="Pesquisar por lote, produto ou colaborador"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </div>

          {carregando ? (
            <p className={styles.subtitle}>Carregando histórico...</p>
          ) : erroCarregar ? (
            <p className={styles.subtitle}>
              Erro ao carregar o histórico. Verifique a conexão e recarregue a
              página.
            </p>
          ) : historicoFiltrado.length === 0 ? (
            <p className={styles.subtitle}>
              {termo
                ? "Nenhum registro encontrado na pesquisa."
                : "Nenhum registro de histórico ainda."}
            </p>
          ) : (
            <ul className={styles.lista}>
              {historicoFiltrado.map((item) => (
                <li key={item.id} className={styles.card}>
                  <div className={styles.linhaTopo}>
                    <span className={styles.rotulo}>Lote</span>
                    <span className={styles.valorDestaque}>
                      {item.codigoLote || item.loteId}
                    </span>
                  </div>
                  <div className={styles.infoExtra}>
                    <div className={styles.campo}>
                      <span className={styles.rotulo}>Produto</span>
                      <span className={styles.valorTexto}>{item.nomeProduto}</span>
                    </div>
                    <div className={styles.campo}>
                      <span className={styles.rotulo}>Colaborador</span>
                      <span className={styles.valorTexto}>
                        {item.nomeColaborador}
                      </span>
                    </div>
                  </div>
                  <div className={styles.detalhes}>
                    <div className={styles.campo}>
                      <span className={styles.rotulo}>Estoque anterior</span>
                      <span className={styles.valor}>{item.estoqueAnterior}</span>
                    </div>
                    <div className={styles.campo}>
                      <span className={styles.rotulo}>Estoque atual</span>
                      <span className={styles.valor}>{item.estoqueAtual}</span>
                    </div>
                  </div>
                  <span className={styles.data}>
                    {formatarDataHora(item.ultimaAtualizacao)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}

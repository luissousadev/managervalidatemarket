"use client";

import { useEffect, useState } from "react";
import MenuSuperior from "@/components/MenuSuperior";
import {
  type Colaborador,
  listarColaboradores,
} from "@/services/colaboradoresService";
import {
  type HistoricoLote,
  listarHistoricoLotes,
} from "@/services/historicoLotesService";
import styles from "./page.module.css";

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

function dataDoRegistro(iso: string): string {
  return iso.slice(0, 10);
}

export default function HistoricoLotes() {
  const [historico, setHistorico] = useState<HistoricoLote[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregar, setErroCarregar] = useState(false);
  const [busca, setBusca] = useState("");
  const [periodoInicial, setPeriodoInicial] = useState("");
  const [periodoFinal, setPeriodoFinal] = useState("");
  const [colaboradorId, setColaboradorId] = useState("");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

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

    listarColaboradores()
      .then((lista) => {
        if (ativo) setColaboradores(lista);
      })
      .catch((erro) => console.error(erro));

    return () => {
      ativo = false;
    };
  }, []);

  const termo = busca.trim().toLowerCase();
  const historicoFiltrado = historico.filter(
    (item) =>
      (!periodoInicial ||
        dataDoRegistro(item.ultimaAtualizacao) >= periodoInicial) &&
      (!periodoFinal || dataDoRegistro(item.ultimaAtualizacao) <= periodoFinal) &&
      (!colaboradorId || String(item.usuarioId) === colaboradorId) &&
      (!termo ||
        String(item.loteId).includes(termo) ||
        item.codigoLote.toLowerCase().includes(termo) ||
        item.nomeProduto.toLowerCase().includes(termo) ||
        item.nomeColaborador.toLowerCase().includes(termo))
  );

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

          <div className={styles.filtros}>
            <div className={styles.filtroCampo}>
              <label className={styles.filtroLabel} htmlFor="periodoInicial">
                Data inicial
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
                Data final
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

          <div className={styles.filtroColaborador}>
            <label className={styles.filtroLabel} htmlFor="colaborador">
              Colaborador
            </label>
            <select
              className={styles.filtroSelect}
              id="colaborador"
              value={colaboradorId}
              onChange={(evento) => setColaboradorId(evento.target.value)}
            >
              <option value="">Todos os colaboradores</option>
              {colaboradores.map((colaborador) => (
                <option key={colaborador.id} value={String(colaborador.id)}>
                  {colaborador.nome}
                </option>
              ))}
            </select>
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
              {termo || periodoInicial || periodoFinal || colaboradorId
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

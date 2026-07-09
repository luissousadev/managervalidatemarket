"use client";

import { useEffect, useState } from "react";
import MenuSuperior from "@/components/MenuSuperior";
import {
  TIPO_COLABORADOR,
  TIPO_GESTOR,
  type Colaborador,
  alterarTipoUsuario,
  listarColaboradores,
} from "@/services/colaboradoresService";
import styles from "./page.module.css";

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

const opcoesTipo = [
  { valor: TIPO_COLABORADOR, rotulo: "Colaborador" },
  { valor: TIPO_GESTOR, rotulo: "Gestor" },
];

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregar, setErroCarregar] = useState(false);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Colaborador | null>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState(TIPO_COLABORADOR);
  const [salvando, setSalvando] = useState(false);

  async function carregarLista() {
    const lista = await listarColaboradores();
    setColaboradores(lista);
  }

  useEffect(() => {
    let ativo = true;
    carregarLista()
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
  const colaboradoresFiltrados = termo
    ? colaboradores.filter(
        (colaborador) =>
          colaborador.nome.toLowerCase().includes(termo) ||
          colaborador.email.toLowerCase().includes(termo)
      )
    : colaboradores;

  function abrirEdicao(colaborador: Colaborador) {
    setEditando(colaborador);
    setTipoSelecionado(colaborador.tipoUsuarioId);
  }

  function fecharModal() {
    if (salvando) return;
    setEditando(null);
  }

  async function salvarTipo() {
    if (!editando) return;

    setSalvando(true);
    try {
      await alterarTipoUsuario(editando.id, tipoSelecionado);
      await carregarLista();
      setEditando(null);
    } catch (erro) {
      console.error(erro);
      alert(
        erro instanceof Error
          ? erro.message
          : "Erro ao alterar o tipo do usuário."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.phone}>
        <main className={styles.screen}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>Colaboradores</h1>
              <p className={styles.subtitle}>
                Usuários do tipo colaborador cadastrados
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
              placeholder="Pesquisar por nome ou e-mail"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </div>

          {carregando ? (
            <p className={styles.subtitle}>Carregando colaboradores...</p>
          ) : erroCarregar ? (
            <p className={styles.subtitle}>
              Erro ao carregar colaboradores. Verifique a conexão e recarregue a
              página.
            </p>
          ) : colaboradoresFiltrados.length === 0 ? (
            <p className={styles.subtitle}>
              {termo
                ? "Nenhum colaborador encontrado na pesquisa."
                : "Nenhum colaborador cadastrado ainda."}
            </p>
          ) : (
            <ul className={styles.lista}>
              {colaboradoresFiltrados.map((colaborador) => (
                <li key={colaborador.id} className={styles.card}>
                  <div className={styles.info}>
                    <span className={styles.nome}>{colaborador.nome}</span>
                    <span className={styles.email}>{colaborador.email}</span>
                    <span className={styles.cadastro}>
                      Cadastro: {formatarData(colaborador.criadoEm)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.acaoEditar}
                    aria-label={`Editar tipo de ${colaborador.nome}`}
                    onClick={() => abrirEdicao(colaborador)}
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
                </li>
              ))}
            </ul>
          )}

          {editando && (
            <div className={styles.modalOverlay} onClick={fecharModal}>
              <div
                className={styles.modalCard}
                onClick={(evento) => evento.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-modal-tipo"
              >
                <h2 className={styles.modalTitulo} id="titulo-modal-tipo">
                  Alterar tipo de usuário
                </h2>
                <p className={styles.modalUsuario}>{editando.nome}</p>
                <p className={styles.modalEmail}>{editando.email}</p>

                <label className={styles.modalLabel} htmlFor="tipoUsuario">
                  Tipo de usuário
                </label>
                <select
                  className={styles.modalSelect}
                  id="tipoUsuario"
                  value={tipoSelecionado}
                  disabled={salvando}
                  onChange={(evento) =>
                    setTipoSelecionado(Number(evento.target.value))
                  }
                >
                  {opcoesTipo.map((opcao) => (
                    <option key={opcao.valor} value={opcao.valor}>
                      {opcao.rotulo}
                    </option>
                  ))}
                </select>

                <div className={styles.modalAcoes}>
                  <button
                    type="button"
                    className={styles.botaoCancelar}
                    disabled={salvando}
                    onClick={fecharModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={styles.botaoSalvar}
                    disabled={salvando}
                    onClick={salvarTipo}
                  >
                    {salvando ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

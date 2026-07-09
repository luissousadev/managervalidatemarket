"use client";

import { useEffect, useState } from "react";
import MenuSuperior from "@/components/MenuSuperior";
import {
  type Colaborador,
  listarColaboradores,
} from "@/services/colaboradoresService";
import styles from "./page.module.css";

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregar, setErroCarregar] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    let ativo = true;
    listarColaboradores()
      .then((lista) => {
        if (ativo) setColaboradores(lista);
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
  const colaboradoresFiltrados = termo
    ? colaboradores.filter(
        (colaborador) =>
          colaborador.nome.toLowerCase().includes(termo) ||
          colaborador.email.toLowerCase().includes(termo)
      )
    : colaboradores;

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
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}

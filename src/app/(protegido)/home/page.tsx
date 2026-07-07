"use client";

import { useEffect, useState } from "react";
import MenuSuperior from "@/components/MenuSuperior";
import { type Lote, listarLotes } from "@/services/lotesService";
import styles from "./page.module.css";

function diasParaVencer(validade: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(validade + "T00:00:00");
  return Math.round((data.getTime() - hoje.getTime()) / 86400000);
}

function formatarData(validade: string): string {
  const [ano, mes, dia] = validade.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString("pt-BR");
}

// Faixas de cor: menos de 15 dias vermelho, menos de 30 amarelo,
// até 60 verde, mais de 60 azul
function statusDoLote(dias: number): { texto: string; classe: string } {
  if (dias < 0) return { texto: "Vencido", classe: "vermelho" };
  if (dias === 0) return { texto: "Vence hoje", classe: "vermelho" };
  const texto = `${dias} dia${dias > 1 ? "s" : ""}`;
  if (dias < 15) return { texto, classe: "vermelho" };
  if (dias < 30) return { texto, classe: "amarelo" };
  if (dias <= 60) return { texto, classe: "verde" };
  return { texto, classe: "azul" };
}

export default function Home() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregar, setErroCarregar] = useState(false);

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

  return (
    <div className={styles.page}>
      <div className={styles.phone}>
        <main className={styles.screen}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>Validades</h1>
              <p className={styles.subtitle}>
                Produtos com vencimento mais próximo
              </p>
            </div>

            <MenuSuperior />
          </header>

          {carregando ? (
            <p className={styles.subtitle}>Carregando validades...</p>
          ) : erroCarregar ? (
            <p className={styles.subtitle}>
              Erro ao carregar os dados do banco. Verifique a conexão e
              recarregue a página.
            </p>
          ) : lotes.length === 0 ? (
            <p className={styles.subtitle}>
              Nenhum lote cadastrado ainda. Cadastre lotes para acompanhar as
              validades aqui.
            </p>
          ) : (
            <ul className={styles.lista}>
              {lotes.map((lote) => {
                const dias = diasParaVencer(lote.validade);
                const status = statusDoLote(dias);
                return (
                  <li key={lote.id} className={styles.card}>
                    <div className={styles.linhaNome}>
                      <span className={styles.nome}>{lote.descricao}</span>
                      <span className={styles.lote}>{lote.codigo}</span>
                    </div>
                    <span className={styles.quantidade}>
                      Qtde: {lote.quantidade} un
                    </span>
                    <div className={styles.linhaRodape}>
                      <div className={styles.datas}>
                        <span className={styles.validade}>
                          Vence em {formatarData(lote.validade)}
                        </span>
                        <span className={styles.conferencia}>
                          {lote.codigoBarras}
                        </span>
                        <span className={styles.atualizacao}>
                          Última atualização: {formatarDataHora(lote.lastUpdate)}
                        </span>
                      </div>
                      <span className={`${styles.badge} ${styles[status.classe]}`}>
                        {status.texto}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}

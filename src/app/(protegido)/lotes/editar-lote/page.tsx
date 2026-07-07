"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type Lote, atualizarLote, buscarLotePorId } from "@/services/lotesService";
import styles from "./page.module.css";

function FormularioEditarLote() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = Number(searchParams.get("id"));
  const idValido = Number.isFinite(id) && id > 0;

  const [lote, setLote] = useState<Lote | null>(null);
  const [carregando, setCarregando] = useState(idValido);
  const [quantidade, setQuantidade] = useState("");
  const [validade, setValidade] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!idValido) return;
    let ativo = true;
    buscarLotePorId(id)
      .then((encontrado) => {
        if (!ativo) return;
        setLote(encontrado);
        if (encontrado) {
          setQuantidade(String(encontrado.quantidade));
          setValidade(encontrado.validade);
        }
      })
      .catch((erro) => {
        console.error(erro);
        if (ativo) alert("Erro ao carregar o lote.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [id, idValido]);

  async function salvar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!lote) return;

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
      await atualizarLote(lote.id, { quantidade: qtde, validade });
      router.push("/lotes");
    } catch (erro) {
      console.error(erro);
      alert(erro instanceof Error ? erro.message : "Erro ao salvar o lote.");
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className={styles.screen}>
        <p className={styles.subtitle}>Carregando lote...</p>
      </main>
    );
  }

  if (!lote) {
    return (
      <main className={styles.screen}>
        <p className={styles.naoEncontrado}>Lote não encontrado.</p>
      </main>
    );
  }

  return (
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

      <h1 className={styles.title}>Editar Lote</h1>
      <p className={styles.subtitle}>Altere os dados do lote {lote.codigo}</p>

      <form className={styles.form} onSubmit={salvar}>
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
            value={lote.codigo}
          />
        </div>

        <label className={styles.label}>Produto vinculado</label>
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
            <span className={styles.produtoNome}>{lote.descricao}</span>
            <span className={styles.produtoCodigo}>{lote.codigoBarras}</span>
          </div>
        </div>

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

        <button className={styles.button} type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </main>
  );
}

export default function EditarLote() {
  return (
    <div className={styles.page}>
      <div className={styles.phone}>
        <Suspense>
          <FormularioEditarLote />
        </Suspense>
      </div>
    </div>
  );
}

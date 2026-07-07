"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  atualizarProduto,
  buscarProdutoPorId,
  criarProduto,
} from "@/services/productsService";
import styles from "./page.module.css";

function FormularioProduto() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const id = idParam ? Number(idParam) : null;
  const editando = id !== null && Number.isFinite(id);

  const [descricao, setDescricao] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!editando) return;
    let ativo = true;
    buscarProdutoPorId(id)
      .then((produto) => {
        if (!ativo) return;
        if (!produto) {
          alert("Produto não encontrado.");
          router.push("/produtos");
          return;
        }
        setDescricao(produto.descricao);
        setCodigoBarras(produto.codigoBarras);
      })
      .catch((erro) => {
        console.error(erro);
        if (ativo) alert("Erro ao carregar o produto.");
      });
    return () => {
      ativo = false;
    };
  }, [editando, id, router]);

  async function salvar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = {
      descricao: descricao.trim(),
      codigoBarras: codigoBarras.trim(),
    };
    if (!dados.descricao || !dados.codigoBarras) {
      alert("Preencha a descrição e o código de barras.");
      return;
    }

    setSalvando(true);
    try {
      if (editando) {
        await atualizarProduto(id, dados);
      } else {
        await criarProduto(dados);
      }
      router.push("/produtos");
    } catch (erro) {
      console.error(erro);
      alert(
        erro instanceof Error ? erro.message : "Erro ao salvar o produto."
      );
      setSalvando(false);
    }
  }

  return (
    <main className={styles.screen}>
      <Link href="/produtos" className={styles.voltar} aria-label="Voltar">
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
      </Link>

      <h1 className={styles.title}>
        {editando ? "Editar Produto" : "Novo Produto"}
      </h1>
      <p className={styles.subtitle}>
        {editando
          ? "Atualize os dados do produto"
          : "Informe os dados do produto para cadastrar"}
      </p>

      <form className={styles.form} onSubmit={salvar}>
        <label className={styles.label} htmlFor="descricao">
          Descrição do produto
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
            <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
            <path d="M3 8l9 5 9-5" />
            <path d="M12 13v8" />
          </svg>
          <input
            className={styles.input}
            id="descricao"
            type="text"
            placeholder="Ex.: Leite Integral 1L"
            value={descricao}
            onChange={(evento) => setDescricao(evento.target.value)}
          />
        </div>

        <label className={styles.label} htmlFor="codigoBarras">
          Código de barras
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
            <path d="M4 6v12" />
            <path d="M8 6v12" />
            <path d="M11 6v12" />
            <path d="M15 6v12" />
            <path d="M18 6v12" />
            <path d="M21 6v12" />
          </svg>
          <input
            className={styles.input}
            id="codigoBarras"
            type="text"
            inputMode="numeric"
            placeholder="Ex.: 7891234567890"
            value={codigoBarras}
            onChange={(evento) => setCodigoBarras(evento.target.value)}
          />
        </div>

        <button className={styles.button} type="submit" disabled={salvando}>
          {salvando
            ? "Salvando..."
            : editando
              ? "Salvar alterações"
              : "Cadastrar"}
        </button>
      </form>
    </main>
  );
}

export default function NovoProduto() {
  return (
    <div className={styles.page}>
      <div className={styles.phone}>
        <Suspense fallback={null}>
          <FormularioProduto />
        </Suspense>
      </div>
    </div>
  );
}

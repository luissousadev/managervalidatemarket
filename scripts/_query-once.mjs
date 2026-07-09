import pg from "pg";

const client = new pg.Client({
  host: process.env.PGHOST,
  port: 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const tabelas = await client.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name ILIKE '%histor%'
  ORDER BY table_name
`);

const nome = tabelas.rows[0]?.table_name;
if (!nome) {
  console.log(JSON.stringify({ tabelas: tabelas.rows, erro: "nenhuma tabela historico" }, null, 2));
  await client.end();
  process.exit(0);
}

const colunas = await client.query(
  `SELECT column_name, data_type FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
  [nome]
);

const registros = await client.query(`SELECT * FROM public.${nome} ORDER BY 1`);

console.log(
  JSON.stringify(
    { tabela: nome, colunas: colunas.rows, total: registros.rowCount, registros: registros.rows },
    null,
    2
  )
);

await client.end();

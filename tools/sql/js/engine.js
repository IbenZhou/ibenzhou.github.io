import { PGlite } from '../vendor/pglite/index.js';
import { splitStatements } from './lexicon.js';

let db = null;

export async function boot() {
  if (db) return db;
  db = new PGlite();
  await db.query('SELECT 1');
  return db;
}

export function isReady() {
  return db !== null;
}

export async function resetSchema() {
  await db.exec('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  // CREATE DATABASE is cluster-level, so it outlives a schema reset.
  const extra = await db.query(
    'SELECT datname FROM pg_database WHERE NOT datistemplate AND datname <> current_database()',
  );
  for (const row of extra.rows ?? []) {
    await db.exec(`DROP DATABASE IF EXISTS "${String(row.datname).replaceAll('"', '""')}"`);
  }
}

function fieldList(r) {
  return (r?.fields ?? []).map(f => ({
    name: String(f.name ?? f).toLowerCase(),
    id: typeof f.dataTypeID === 'number' ? f.dataTypeID : null,
  }));
}

export async function query(sql, params = []) {
  const r = await db.query(sql, params);
  return { rows: r?.rows ?? [], fields: fieldList(r) };
}

export async function exec(sql) {
  await db.exec(sql);
}

export function describeError(e) {
  const first = String(e?.message ?? e).split('\n')[0].trim();
  return {
    message: first,
    detail: e?.detail ? String(e.detail).trim() : '',
    hint: e?.hint ? String(e.hint).trim() : '',
    position: typeof e?.position === 'number' ? e.position : null,
  };
}

export async function runScript(sql) {  const statements = splitStatements(sql);
  const results = [];

  for (let i = 0; i < statements.length; i++) {
    const st = statements[i];
    try {
      const r = await db.query(st.text);
      results.push({
        index: i,
        sql: st.text,
        start: st.start,
        end: st.end,
        ok: true,
        rows: r?.rows ?? [],
        fields: fieldList(r),
        affected: typeof r?.affectedRows === 'number' ? r.affectedRows : null,
      });
    } catch (e) {
      const err = describeError(e);
      results.push({
        index: i,
        sql: st.text,
        start: st.start,
        end: st.end,
        ok: false,
        error: err,
        caret: err.position ? st.start + Math.max(0, err.position - 1) : st.start,
      });
      break;
    }
  }
  return { results, ranAll: results.length === statements.length };
}

export async function listTables() {
  const r = await db.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
  );
  return (r.rows ?? []).map(x => x.table_name);
}

export async function listDatabases() {
  const r = await db.query(
    'SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname',
  );
  return (r.rows ?? []).map(x => x.datname);
}

const DATA_TYPE_CANON = {
  'character varying': 'VARCHAR',
  character: 'CHARACTER',
  boolean: 'BOOLEAN',
  integer: 'INTEGER',
  bigint: 'BIGINT',
  smallint: 'SMALLINT',
  real: 'REAL',
  'double precision': 'DOUBLE PRECISION',
  numeric: 'NUMERIC',
  date: 'DATE',
  'time without time zone': 'TIME',
  'time with time zone': 'TIME',
  timestamp: 'TIMESTAMP',
  text: 'TEXT',
};

export async function describeTable(name) {
  const target = String(name).toLowerCase();
  const cols = await db.query(
    `SELECT column_name, data_type, character_maximum_length, is_nullable
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position`,
    [target],
  );

  const pk = await db.query(
    `SELECT kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public' AND tc.table_name = $1
      ORDER BY kcu.ordinal_position`,
    [target],
  );

  const fk = await db.query(
    `SELECT kcu.column_name, ccu.table_name AS ref_table, ccu.column_name AS ref_column
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
       JOIN information_schema.constraint_column_usage ccu
         ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' AND tc.table_name = $1
      ORDER BY kcu.column_name`,
    [target],
  );

  return {
    table: target,
    columns: (cols.rows ?? []).map(c => ({
      name: c.column_name,
      type: DATA_TYPE_CANON[c.data_type] ?? c.data_type,
      length: c.character_maximum_length ?? null,
      nullable: c.is_nullable === 'YES',
    })),
    primaryKey: (pk.rows ?? []).map(r => r.column_name),
    foreignKeys: (fk.rows ?? []).map(r => ({
      column: r.column_name,
      table: r.ref_table,
      column2: r.ref_column,
    })),
  };
}

export async function tableRows(name) {
  const target = String(name).toLowerCase();
  const r = await db.query(`SELECT * FROM "${target}"`);
  return { fields: fieldList(r), rows: r.rows ?? [] };
}

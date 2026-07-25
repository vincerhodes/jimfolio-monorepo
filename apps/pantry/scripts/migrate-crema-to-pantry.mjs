// One-off data migration: copy Recipe + PantryItem rows from the crema
// sqlite DB into the pantry app's sqlite DB, preserving id and createdAt.
//
// Usage (from repo root):
//   set -a; . apps/crema/.env; set +a
//   node apps/pantry/scripts/migrate-crema-to-pantry.mjs "file:./dev.db"
//
// Source DB URL comes from process.env.DATABASE_URL (crema's .env).
// Target DB URL comes from argv[2] or PANTRY_DATABASE_URL.
// Relative "file:./..." URLs resolve against each app's prisma/ directory,
// matching Prisma's own convention.

import { createClient } from "@libsql/client";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC_PRISMA_DIR = path.resolve(here, "../../crema/prisma");
const DST_PRISMA_DIR = path.resolve(here, "../prisma");

function resolveUrl(url, prismaDir) {
  if (!url) throw new Error("missing database URL");
  if (url.startsWith("file:") && !url.startsWith("file:/")) {
    const rel = url.slice("file:".length);
    return "file:" + path.resolve(prismaDir, rel);
  }
  return url;
}

const srcUrl = resolveUrl(process.env.DATABASE_URL, SRC_PRISMA_DIR);
const dstUrl = resolveUrl(
  process.argv[2] ?? process.env.PANTRY_DATABASE_URL,
  DST_PRISMA_DIR
);

// Remote libsql URLs authenticate via SRC_AUTH_TOKEN / DST_AUTH_TOKEN env.
const src = createClient({ url: srcUrl, authToken: process.env.SRC_AUTH_TOKEN });
const dst = createClient({ url: dstUrl, authToken: process.env.DST_AUTH_TOKEN });

const TABLES = ["Recipe", "PantryItem"];

async function tableNames(client) {
  const rs = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table'"
  );
  return new Set(rs.rows.map((r) => r.name));
}

async function columns(client, table) {
  const rs = await client.execute(`PRAGMA table_info("${table}")`);
  return rs.rows.map((r) => r.name);
}

const srcTables = await tableNames(src);
const dstTables = await tableNames(dst);

for (const table of TABLES) {
  if (!srcTables.has(table)) throw new Error(`source missing table ${table}`);
  if (!dstTables.has(table))
    throw new Error(`target missing table ${table} — run prisma db push first`);

  const cols = await columns(src, table);
  const colList = cols.map((c) => `"${c}"`).join(", ");
  const placeholders = cols.map(() => "?").join(", ");

  const rs = await src.execute(`SELECT ${colList} FROM "${table}"`);
  console.log(`${table}: ${rs.rows.length} rows in source`);

  // HTTP libsql can't hold an interactive transaction across execute()
  // calls — batch() runs all inserts atomically instead.
  const stmts = rs.rows.map((row) => ({
    sql: `INSERT OR IGNORE INTO "${table}" (${colList}) VALUES (${placeholders})`,
    args: cols.map((c) => row[c]),
  }));
  await dst.batch(stmts, "write");

  const count = await dst.execute(`SELECT COUNT(*) AS n FROM "${table}"`);
  console.log(`${table}: ${count.rows[0].n} rows in target after insert`);
}

src.close();
dst.close();
console.log("migration complete");

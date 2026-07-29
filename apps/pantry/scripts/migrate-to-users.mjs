// Schema + data migration: introduce User/Session tables, add userId and
// isPublic columns to Recipe/PantryItem, and assign all existing rows to the
// "Jimmy" user. Idempotent — safe to run repeatedly.
//
// Usage (from apps/pantry):
//   # Local sqlite (DATABASE_URL from .env, or default file:./dev.db):
//   JIMMY_PASSWORD=... node scripts/migrate-to-users.mjs
//   # Prod Turso:
//   JIMMY_PASSWORD=... TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... \
//     node scripts/migrate-to-users.mjs
//
// scrypt hash format matches lib/auth.ts: "<salt_hex>:<hash_hex>".

import { createClient } from "@libsql/client";
import { scryptSync, randomBytes, randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const PRISMA_DIR = path.resolve(here, "../prisma");

const JIMMY_EMAIL = "vincerhodes@gmail.com";
const JIMMY_NAME = "Jimmy";

const password = process.env.JIMMY_PASSWORD;
if (!password || password.length < 8) {
  console.error("JIMMY_PASSWORD env var required (min 8 chars)");
  process.exit(1);
}

function resolveUrl(url) {
  if (url.startsWith("file:") && !url.startsWith("file:/")) {
    return "file:" + path.resolve(PRISMA_DIR, url.slice("file:".length));
  }
  return url;
}

const url = process.env.TURSO_DATABASE_URL
  ? process.env.TURSO_DATABASE_URL
  : resolveUrl(process.env.DATABASE_URL ?? "file:./dev.db");

const db = createClient({
  url,
  authToken: process.env.TURSO_DATABASE_URL
    ? process.env.TURSO_AUTH_TOKEN
    : undefined,
});

function hashPassword(pw) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function columns(table) {
  const rs = await db.execute(`PRAGMA table_info("${table}")`);
  return new Set(rs.rows.map((r) => r.name));
}

async function indexNames() {
  const rs = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='index'"
  );
  return new Set(rs.rows.map((r) => r.name));
}

async function addColumnIfMissing(table, ddl, column) {
  const cols = await columns(table);
  if (cols.has(column)) {
    console.log(`${table}.${column}: already present, skipping`);
  } else {
    await db.execute(`ALTER TABLE "${table}" ADD COLUMN ${ddl}`);
    console.log(`${table}.${column}: added`);
  }
}

// 1. User + Session tables
await db.execute(`CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);
await db.execute(
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`
);
await db.execute(`CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "expiresAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
)`);
console.log("User/Session tables: ok");

// 2. New columns (NOT NULL with defaults so existing rows survive)
await addColumnIfMissing("Recipe", `"userId" TEXT NOT NULL DEFAULT ''`, "userId");
await addColumnIfMissing("Recipe", `"isPublic" INTEGER NOT NULL DEFAULT 0`, "isPublic");
await addColumnIfMissing("PantryItem", `"userId" TEXT NOT NULL DEFAULT ''`, "userId");

// 3. Swap PantryItem unique index from (name) to (userId, name)
const idx = await indexNames();
if (idx.has("PantryItem_name_key")) {
  await db.execute(`DROP INDEX "PantryItem_name_key"`);
  console.log("dropped old PantryItem_name_key index");
}
await db.execute(
  `CREATE UNIQUE INDEX IF NOT EXISTS "PantryItem_userId_name_key" ON "PantryItem"("userId", "name")`
);

// 4. Jimmy user (upsert by email)
const existing = await db.execute({
  sql: `SELECT "id" FROM "User" WHERE "email" = ?`,
  args: [JIMMY_EMAIL],
});
let jimmyId;
if (existing.rows.length > 0) {
  jimmyId = existing.rows[0].id;
  console.log(`Jimmy user already exists: ${jimmyId}`);
} else {
  jimmyId = randomUUID();
  await db.execute({
    sql: `INSERT INTO "User" ("id", "email", "name", "passwordHash") VALUES (?, ?, ?, ?)`,
    args: [jimmyId, JIMMY_EMAIL, JIMMY_NAME, hashPassword(password)],
  });
  console.log(`Jimmy user created: ${jimmyId}`);
}

// 5. Backfill existing rows
const r = await db.execute({
  sql: `UPDATE "Recipe" SET "userId" = ? WHERE "userId" = ''`,
  args: [jimmyId],
});
const p = await db.execute({
  sql: `UPDATE "PantryItem" SET "userId" = ? WHERE "userId" = ''`,
  args: [jimmyId],
});
console.log(`backfilled: ${r.rowsAffected} recipes, ${p.rowsAffected} pantry items`);

// 6. Verify
for (const table of ["Recipe", "PantryItem"]) {
  const total = await db.execute(`SELECT COUNT(*) AS n FROM "${table}"`);
  const orphan = await db.execute(
    `SELECT COUNT(*) AS n FROM "${table}" WHERE "userId" = ''`
  );
  console.log(`${table}: ${total.rows[0].n} rows, ${orphan.rows[0].n} without owner`);
}
const users = await db.execute(`SELECT "email", "name" FROM "User"`);
console.log("users:", JSON.stringify(users.rows));

db.close();
console.log("migration complete");

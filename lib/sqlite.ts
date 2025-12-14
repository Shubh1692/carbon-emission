
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "app.db");

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

export const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_projects_updatedAt ON projects(updatedAt);

  -- ✅ Save every submit as a "batch"
  CREATE TABLE IF NOT EXISTS project_estimate_batches (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    activities TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY(projectId) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_batches_projectId_createdAt
    ON project_estimate_batches(projectId, createdAt);

  CREATE TABLE IF NOT EXISTS retirement_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT,
    asset_price_source_id TEXT NOT NULL,
    quote_uuid TEXT UNIQUE,
    status TEXT,
    quantity_tonnes REAL NOT NULL,
    beneficiary_name TEXT,
    retirement_message TEXT,
    polygonscan_url TEXT,
    view_retirement_url TEXT,
    raw_quote_json TEXT,
    raw_order_json TEXT,
    unit_price TEXT,
    total_cost TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_retirement_orders_quote_uuid ON retirement_orders(quote_uuid);
`);

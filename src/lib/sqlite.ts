import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbFile = './mydb.sqlite';

async function openDb() {
  const db = await open({
    filename: dbFile,
    driver: sqlite3.Database
  });
  return db;
}

export async function initializeDatabase() {
  const db = await openDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Operations (
      operation_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      base_labor_cost REAL NOT NULL
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Product_Operations (
      product_id INTEGER NOT NULL,
      operation_id INTEGER NOT NULL,
      cost_multiplier REAL NOT NULL DEFAULT 1.0,
      PRIMARY KEY (product_id, operation_id),
      FOREIGN KEY (product_id) REFERENCES Products(id),
      FOREIGN KEY (operation_id) REFERENCES Operations(operation_id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Materials (
      material_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      cost_per_mm REAL NOT NULL
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Coatings (
      coating_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      cost_per_mm REAL NOT NULL
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS CostParameters (
      parameter_id INTEGER PRIMARY KEY,
      labor_rate REAL NOT NULL,
      overhead_rate REAL NOT NULL
    )
  `);

   await db.exec(`
    CREATE TABLE IF NOT EXISTS ProductConfiguration (
      config_id INTEGER PRIMARY KEY,
      product_id INTEGER NOT NULL,
      material_id INTEGER NOT NULL,
      coating_id INTEGER NOT NULL,
      FOREIGN KEY (product_id) REFERENCES Products(id),
      FOREIGN KEY (material_id) REFERENCES Materials(material_id),
      FOREIGN KEY (coating_id) REFERENCES Coatings(coating_id)
    )
  `);
}


export { openDb, initializeDatabase };

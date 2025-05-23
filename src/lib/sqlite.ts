'use server';
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';

const dbFile = path.resolve('./mydb.sqlite');

let dbInstance: Database | null = null;

async function openDb(): Promise<Database> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const db = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        console.error("Error opening database:", err.message);
        reject(err);
      } else {
        console.log("Connected to the database.");
        dbInstance = db;
        resolve(db);
      }
    });
  });
}

export async function initializeDatabase() {
  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS Products (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error("Error creating Products table:", err.message);
          reject(err);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS Operations (
          operation_id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          base_labor_cost REAL NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error("Error creating Operations table:", err.message);
          reject(err);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS Product_Operations (
          product_id INTEGER NOT NULL,
          operation_id INTEGER NOT NULL,
          cost_multiplier REAL NOT NULL DEFAULT 1.0,
          PRIMARY KEY (product_id, operation_id),
          FOREIGN KEY (product_id) REFERENCES Products(id),
          FOREIGN KEY (operation_id) REFERENCES Operations(operation_id)
        )
      `, (err) => {
        if (err) {
          console.error("Error creating Product_Operations table:", err.message);
          reject(err);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS Materials (
          material_id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          cost_per_mm REAL NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error("Error creating Materials table:", err.message);
          reject(err);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS Coatings (
          coating_id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          cost_per_mm REAL NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error("Error creating Coatings table:", err.message);
          reject(err);
          return;
        }
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS CostParameters (
          parameter_id INTEGER PRIMARY KEY,
          labor_rate REAL NOT NULL,
          overhead_rate REAL NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error("Error creating CostParameters table:", err.message);
          reject(err);
          return;
        }
      });

       db.run(`
        CREATE TABLE IF NOT EXISTS ProductConfiguration (
          config_id INTEGER PRIMARY KEY,
          product_id INTEGER NOT NULL,
          material_id INTEGER NOT NULL,
          coating_id INTEGER NOT NULL,
          FOREIGN KEY (product_id) REFERENCES Products(id),
          FOREIGN KEY (material_id) REFERENCES Materials(material_id),
          FOREIGN KEY (coating_id) REFERENCES Coatings(coating_id)
        )
      `, (err) => {
        if (err) {
          console.error("Error creating ProductConfiguration table:", err.message);
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}


export { openDb, initializeDatabase };

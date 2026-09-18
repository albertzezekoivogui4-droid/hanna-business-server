// Petite base de données fichier (JSON) — suffisante pour démarrer.
// Peut être remplacée plus tard par une vraie base (Postgres, MongoDB) sans
// changer les routes, si la boutique grandit beaucoup.
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "data", "db.json");

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { products: [], orders: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };

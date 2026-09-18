const express = require("express");
const { v4: uuid } = require("uuid");
const { readDB, writeDB } = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// POST /api/orders — public : un client passe commande
router.post("/", (req, res) => {
  const { items, customer, payment } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Le panier est vide" });
  }
  const db = readDB();

  // On recalcule les prix côté serveur à partir du catalogue réel,
  // pour ne jamais faire confiance à un prix envoyé par le navigateur.
  let total = 0;
  const lines = items.map((it) => {
    const product = db.products.find((p) => p.id === it.id);
    if (!product) throw new Error("Article introuvable: " + it.id);
    const qty = Math.max(1, Number(it.qty) || 1);
    total += product.price * qty;
    return { productId: product.id, name: product.name, price: product.price, qty };
  });

  const order = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    status: "en_attente", // en_attente -> payee (ou confirmee) -> livree / annulee
    lines,
    total,
    customer: customer || {},
    payment: { method: payment?.method || "mobile", status: "en_attente" },
  };
  db.orders.push(order);
  writeDB(db);
  res.status(201).json(order);
});

// GET /api/orders — admin uniquement : liste des commandes
router.get("/", requireAdmin, (req, res) => {
  const db = readDB();
  res.json(db.orders.slice().reverse());
});

// PUT /api/orders/:id/status — admin uniquement : changer le statut d'une commande
router.put("/:id/status", requireAdmin, (req, res) => {
  const { status } = req.body;
  const db = readDB();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Commande introuvable" });
  order.status = status;
  writeDB(db);
  res.json(order);
});

module.exports = router;

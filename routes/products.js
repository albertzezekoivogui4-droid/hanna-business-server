const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuid } = require("uuid");
const { readDB, writeDB } = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, uuid() + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max par photo
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Fichier non image refusé"));
    cb(null, true);
  },
});

// GET /api/products — public, tout le monde (clients) peut lire le catalogue
router.get("/", (req, res) => {
  const db = readDB();
  res.json(db.products);
});

// GET /api/products/:id — public
router.get("/:id", (req, res) => {
  const db = readDB();
  const p = db.products.find((p) => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Article introuvable" });
  res.json(p);
});

// POST /api/products — admin uniquement, avec photo optionnelle (champ "photo")
router.post("/", requireAdmin, upload.single("photo"), (req, res) => {
  const { name, desc, price, cat } = req.body;
  if (!name || !price || !cat) {
    return res.status(400).json({ error: "Nom, prix et catégorie sont obligatoires" });
  }
  const db = readDB();
  const product = {
    id: uuid(),
    name,
    desc: desc || "",
    price: Number(price),
    cat,
    image: req.file ? `/uploads/${req.file.filename}` : null,
  };
  db.products.push(product);
  writeDB(db);
  res.status(201).json(product);
});

// PUT /api/products/:id — admin uniquement, mise à jour (avec ou sans nouvelle photo)
router.put("/:id", requireAdmin, upload.single("photo"), (req, res) => {
  const db = readDB();
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Article introuvable" });

  const { name, desc, price, cat } = req.body;
  const existing = db.products[idx];
  db.products[idx] = {
    ...existing,
    name: name ?? existing.name,
    desc: desc ?? existing.desc,
    price: price !== undefined ? Number(price) : existing.price,
    cat: cat ?? existing.cat,
    image: req.file ? `/uploads/${req.file.filename}` : existing.image,
  };
  writeDB(db);
  res.json(db.products[idx]);
});

// DELETE /api/products/:id — admin uniquement
router.delete("/:id", requireAdmin, (req, res) => {
  const db = readDB();
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== req.params.id);
  if (db.products.length === before) return res.status(404).json({ error: "Article introuvable" });
  writeDB(db);
  res.status(204).end();
});

module.exports = router;

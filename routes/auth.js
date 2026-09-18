const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Connexion admin : un seul compte, mot de passe défini dans .env (ADMIN_PASSWORD).
// Simple et suffisant pour un seul gérant ; si plusieurs personnes doivent
// se connecter avec des comptes distincts plus tard, on pourra passer à une
// vraie table "users" (comme pour Kakoulimayah).
router.post("/login", (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Mot de passe incorrect" });
  }
  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

module.exports = router;

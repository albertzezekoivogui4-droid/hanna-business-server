const express = require("express");
const fetch = require("node-fetch");
const { readDB, writeDB } = require("../db");

const router = express.Router();

function orangeMoneyConfigured() {
  return !!(process.env.OM_CLIENT_ID && process.env.OM_CLIENT_SECRET && process.env.OM_MERCHANT_KEY);
}

// Récupère un jeton d'accès OAuth auprès d'Orange Money.
async function getAccessToken() {
  const basic = Buffer.from(
    `${process.env.OM_CLIENT_ID}:${process.env.OM_CLIENT_SECRET}`
  ).toString("base64");

  const resp = await fetch("https://api.orange.com/oauth/v3/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!resp.ok) throw new Error("Échec authentification Orange Money");
  const data = await resp.json();
  return data.access_token;
}

// POST /api/payment/initiate  { orderId }
// Démarre un paiement Orange Money pour une commande existante et renvoie
// l'URL de paiement vers laquelle rediriger le client.
router.post("/initiate", async (req, res) => {
  const { orderId } = req.body;
  const db = readDB();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return res.status(404).json({ error: "Commande introuvable" });

  if (!orangeMoneyConfigured()) {
    // Tant que les identifiants marchands ne sont pas dans .env, on ne peut
    // pas déclencher de vrai paiement. On le dit clairement plutôt que
    // d'échouer silencieusement.
    return res.status(503).json({
      error:
        "Le paiement automatique Orange Money n'est pas encore activé (identifiants marchands manquants dans .env). La commande a bien été enregistrée ; réglez-la par mobile money manuel ou espèces en attendant.",
      order,
    });
  }

  try {
    const token = await getAccessToken();
    const payload = {
      merchant_key: process.env.OM_MERCHANT_KEY,
      currency: "GNF",
      order_id: order.id,
      amount: order.total,
      return_url: `${process.env.PUBLIC_BASE_URL}/paiement/succes?order=${order.id}`,
      cancel_url: `${process.env.PUBLIC_BASE_URL}/paiement/annule?order=${order.id}`,
      notif_url: `${process.env.PUBLIC_BASE_URL}/api/payment/notify`,
      lang: "fr",
      reference: order.id,
    };

    const resp = await fetch(`${process.env.OM_API_BASE_URL}/webpayment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Échec de création du paiement");

    order.payment.paytoken = data.pay_token;
    writeDB(db);

    res.json({ payment_url: data.payment_url });
  } catch (err) {
    console.error("Erreur paiement Orange Money:", err);
    res.status(500).json({ error: "Impossible de démarrer le paiement pour le moment" });
  }
});

// POST /api/payment/notify — appelé par Orange Money pour confirmer un paiement.
// À déclarer comme "notif_url" côté Orange Money une fois le compte marchand actif.
router.post("/notify", (req, res) => {
  const { order_id, status } = req.body;
  const db = readDB();
  const order = db.orders.find((o) => o.id === order_id);
  if (order && status === "SUCCESS") {
    order.payment.status = "payee";
    order.status = "payee";
    writeDB(db);
  }
  res.sendStatus(200);
});

module.exports = router;

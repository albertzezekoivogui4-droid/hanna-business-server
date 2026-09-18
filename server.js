require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payment");

const app = express();

app.use(cors());
app.use(express.json());

// Sert les fichiers de la boutique (storefront + admin) et les photos uploadées
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true, name: "hanna-business-server" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`HANNA BUSINESS server prêt sur le port ${PORT}`);
});

# HANNA BUSINESS — Serveur boutique

Backend complet de la boutique HANNA BUSINESS : catalogue, panier, commandes,
espace admin (ajout/modification/suppression d'articles avec photo), et
intégration Orange Money prête à activer.

Construit sur le même principe que le serveur du projet Kakoulimayah :
un vrai backend, à vous, hébergé où vous voulez.

## 1. Installation en local (pour tester avant de déployer)

Prérequis : [Node.js](https://nodejs.org) version 18 ou plus, installé sur votre ordinateur.

```bash
cd hanna-business-server
npm install
cp .env.example .env
```

Ouvrez `.env` et changez au minimum :
- `ADMIN_PASSWORD` → le mot de passe que vous utiliserez pour vous connecter à `/admin.html`
- `JWT_SECRET` → une longue chaîne de caractères aléatoire (n'importe laquelle, gardez-la secrète)

Puis lancez le serveur :

```bash
npm start
```

- Boutique publique : http://localhost:4000
- Espace admin : http://localhost:4000/admin.html

## 2. Ajouter/modifier vos articles

Allez sur `/admin.html`, connectez-vous avec `ADMIN_PASSWORD`, et gérez vos
articles (nom, prix, catégorie, description, photo) directement — aucune
intervention de ma part n'est nécessaire une fois le serveur en ligne.

## 3. Déploiement (hébergement séparé, public, permanent)

Comme vous avez choisi un hébergement à part de Kakoulimayah, voici les
options les plus simples pour un projet comme celui-ci (gratuites pour
démarrer) :

**Option recommandée : Render.com**
1. Créez un compte sur [render.com](https://render.com)
2. Mettez ce dossier sur un dépôt GitHub (privé si vous voulez)
3. Sur Render : "New +" → "Web Service" → connectez le dépôt
4. Build command : `npm install` — Start command : `npm start`
5. Dans l'onglet "Environment", ajoutez toutes les variables de votre `.env`
   (elles ne doivent jamais être mises dans le dépôt GitHub lui-même)
6. Render vous donne une URL publique du type `https://hanna-business.onrender.com`

**Alternative : Railway.app** — fonctionne sur le même principe, interface
en quelques clics, variables d'environnement dans l'onglet "Variables".

⚠️ Sur ces hébergements gratuits, le stockage des photos uploadées
(`/uploads`) peut être effacé à chaque redéploiement. Si vous comptez
uploader beaucoup de photos, dites-le-moi : on branchera un stockage
externe (comme Cloudinary, gratuit jusqu'à un certain volume) pour que vos
photos restent définitivement enregistrées.

## 4. Activer le paiement automatique Orange Money

Dès que vous recevez vos identifiants marchands Orange Money
(`client_id`, `client_secret`, `merchant_key`), ajoutez-les dans les
variables d'environnement (`OM_CLIENT_ID`, `OM_CLIENT_SECRET`,
`OM_MERCHANT_KEY`) ainsi que `PUBLIC_BASE_URL` (l'adresse publique de votre
serveur une fois déployé). Le paiement automatique s'activera alors sans
qu'on ait besoin de retoucher le code.

En attendant ces identifiants, la boutique fonctionne déjà normalement :
les commandes sont enregistrées, et la confirmation se fait via WhatsApp
avec les instructions de paiement mobile money manuel.

## Structure du projet

```
hanna-business-server/
├── server.js              → point d'entrée
├── db.js                  → base de données fichier (data/db.json)
├── middleware/auth.js      → vérification de connexion admin
├── routes/
│   ├── auth.js             → connexion admin
│   ├── products.js         → catalogue (lecture publique, écriture admin)
│   ├── orders.js           → commandes
│   └── payment.js          → intégration Orange Money
├── public/
│   ├── index.html           → boutique publique
│   └── admin.html           → espace de gestion
├── uploads/                → photos des articles
└── data/db.json             → toutes vos données (produits + commandes)
```

## Besoin d'aide pour la suite ?

Dites-moi simplement où vous en êtes (compte Render créé, identifiants
Orange Money reçus, etc.) et je vous accompagne à chaque étape.

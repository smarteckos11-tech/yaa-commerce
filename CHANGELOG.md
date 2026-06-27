# Changelog — YAA Commerce

Tous les changements notables du projet YAA Commerce sont documentés ici.

## [1.0.0] — 2026-06-26

### 🎉 Version initiale — Production Ready

---

### ✨ Fonctionnalités principales

#### Landing Page Premium
- Hero carrousel 5 slides (Création boutique, Ambitions, WhatsApp, Livraison, IA)
- Animations Framer Motion (floating, staggered, reveal on scroll)
- Section partenaires avec logos officiels (Wave, Orange Money, MTN, Moov, CinetPay, WhatsApp, Yango, DHL)
- Stats bar animée (250K commandes, 10K marchands, 15+ pays, 99.9% uptime)
- 8 fonctionnalités avec illustrations SVG custom
- Dashboard preview avec laptop mockup + Recharts (area, pie, bar charts)
- 4 témoignages avec photos réelles d'entrepreneurs africains
- Tarifs style Stripe (3 plans : Découverte 2900, Business 4900, Pro 9900 FCFA)
- CTA final + Footer avec citation, liens, réseaux sociaux
- Logo YAA avec chariot de boutique
- Dark/light mode

#### Dashboard Admin (15 pages)
1. **Tableau de Bord** — 4 stat cards + commandes récentes (avec COD à encaisser)
2. **Produits** — Catalogue avec filtres search + catégorie fonctionnels, 10 produits mock
3. **Éditeur Produit** (/admin/produits/nouveau) — Style Shopify :
   - Upload 6 photos via Cloudinary
   - Description avec génération IA
   - Prix + prix barré (promo)
   - Stock + SKU + poids
   - Catégorie + type (physique/digital)
   - Aperçu SEO en temps réel
4. **Bundles** — Offres groupées avec réduction, modal création
5. **Codes Promo** — Tableau avec barres d'usage, modal création (% ou fixe)
6. **Commandes** — Kanban 5 colonnes avec cartes détaillées + badges COD
7. **Clients** — Tableau avec fidélité, segments VIP, dépenses totales
8. **Paiements** — 3 tabs (Fournisseurs, Transactions, COD Réconciliation)
   - 10 fournisseurs Mobile Money (Wave, OM, MTN, Moov, CinetPay, COD, PayDunya, Stripe, PayPal)
   - COD : 4 stats (À collecter, Collecté, Écarts, Réconcilié) + table réconciliation
9. **WhatsApp Commerce** — Chat split-panel + catalogue + auto-réponses + campagnes
10. **Livraisons** — Expéditions + transporteurs + calculateur interactif (Yango/DHL/FedEx)
    - Colonne COD avec statut + bouton "Confirmer encaissement"
11. **Marketing** — 4 canaux + 6 campagnes + 6 segments IA + 5 automatisations
12. **IA YaaMind** — Chat IA avec modèles (GPT-4o, Claude 3.5, Gemini, DeepSeek)
    - 6 quick actions + parsing markdown + suggestions IA + copier
13. **Analytics** — Recharts (AreaChart revenus, BarChart funnel, PieChart trafic)
    - Prédictions IA + top villes animées
14. **MCP Connecteurs** — 8 cartes (Gmail, Calendar, Notion, Slack, Discord, WordPress, Airtable, Drive)
15. **Marketplace** — 6 catégories + extensions "Bientôt disponible" avec descriptions projet
16. **Super Admin** — White-label (color picker, logo upload, domaine custom) + plans + rôles
17. **Messages** — Lecture des messages de contact depuis Supabase

#### Paiement à la Livraison (COD)
- Type `PaymentMethod` étendu avec "Paiement à la livraison"
- 4 statuts COD : a_collecter → collecte → non_collecte → reconcilie
- Table `COD_ORDERS` avec montant à collecter, livreur, écarts
- COD intégré dans Dashboard, Commandes, Paiements, Livraisons
- Workflow complet de réconciliation

#### Authentification Supabase (réelle)
- Page `/login` — `signInWithPassword` + OAuth Google
- Page `/signup` — `signUp` + création auto profil (trigger SQL)
- Page `/forgot-password` — `resetPasswordForEmail`
- Hook `useAuth` — écoute session globalement
- Bouton "Déconnexion" fonctionnel (`signOut` + redirect)
- Topbar dynamique (avatar + plan du user connecté)
- Middleware Next.js pour refresh session

#### Storefront Public
- Page produit publique `/b/[slug]/p/[id]`
- Galerie photos + quantité + CTAs (Panier + WhatsApp)
- Paiement à la livraison mis en avant
- Garanties (livraison 24h, paiement sécurisé, retour gratuit)

#### Intégration Cloudinary
- Composant `<ImageUploader>` réutilisable (upload multiple, validation, preview)
- Route API `/api/cloudinary/sign` (signature serveur sécurisée)
- Variables d'environnement (cloud_name, API key, secret)

#### API Routes
- `POST /api/contact` — Insert message dans Supabase `contact_messages`
- `GET /api/contact` — Lecture messages (admin)
- `GET /api/health` — Healthcheck connexion Supabase
- `POST /api/cloudinary/sign` — Signature upload Cloudinary

---

### 🔧 Infrastructure

#### Base de données Supabase
- 11 tables : profiles, products, customers, orders, shipments, transactions, payment_providers, whatsapp_conversations, whatsapp_messages, marketing_campaigns, contact_messages
- Row Level Security activé sur toutes les tables
- Trigger auto-création profil à l'inscription
- Index de performance
- Champs COD complets (cod_amount, cod_status, cod_collected_by, cod_discrepancy)
- Schéma SQL fourni (`supabase-schema.sql`)

#### Clients Supabase
- `supabase-client.ts` — Client navigateur (anon key, SSR-safe via @supabase/ssr)
- `supabase-server.ts` — Client server components (cookies session)
- `supabase-admin.ts` — Client admin (service_role, serveur uniquement)
- `middleware.ts` — Refresh session à chaque requête

#### Design System
- Palette YAA complète : green (#0F8A5F) + orange (#F97316) + gray scales 50-900
- Dark mode complet (variables CSS .dark)
- Polices : Inter (body) + Plus Jakarta Sans (titres)
- Composants shadcn/ui (Card, Button, Badge, Input, Tabs, Select, Dialog, DropdownMenu, Avatar, Progress, Switch, etc.)
- Framer Motion sur toutes les pages (staggered animations)

#### Pages Auth & Public
- `/login` — Connexion avec email/password + Google OAuth
- `/signup` — Inscription avec plan/feature préselectionnés (query params)
- `/forgot-password` — Récupération mot de passe
- `/demo` — Page vitrine des 15 pages admin
- `/contact` — Formulaire avec API route (écrit dans Supabase)

---

### 🐛 Bugs corrigés
- Typo "Échecé" → "Échec" (admin-data.ts + paiements/page.tsx)
- Incohérence Flutterwave retiré (pas dans les partners landing)
- Dashboard : 4e stat remplacé par "COD à encaisser" (plus pertinent)
- Page Produits : search + filtre catégorie fonctionnels
- Page Produits : bouton "Ajouter" → ouvre éditeur complet (pas modal simple)
- Navbar : restructurée en flexbox (écritures ne se chevauchent plus)
- Logo : chariot de boutique simple sans Y superposé
- Bouton "Déconnexion" : fonctionnel via supabase.auth.signOut()
- Fichiers manquants après rebase : restaurés (bundles, promo-codes, product editor, use-auth, image-uploader)

---

### 📦 Stack technique
- **Framework** : Next.js 16 (App Router, Turbopack)
- **Langage** : TypeScript 5
- **Styling** : Tailwind CSS 4 + shadcn/ui
- **Animations** : Framer Motion
- **Charts** : Recharts
- **Auth + DB** : Supabase (@supabase/ssr + @supabase/supabase-js)
- **Images** : Cloudinary (cloudinary + next-cloudinary)
- **Thème** : next-themes (dark/light)
- **Icons** : Lucide React
- **Runtime** : Bun

---

### 📊 Métriques du projet
- **29 routes** (pages + API)
- **~150 fichiers** source
- **11 tables** Supabase
- **0 erreur** ESLint
- **Build production** : 14.2s compile + 0.7s static generation

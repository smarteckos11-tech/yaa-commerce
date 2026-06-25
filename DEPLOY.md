# 🚀 Guide de Déploiement YAA Commerce

Déploiement gratuit en **~20 minutes** sur Vercel + Supabase.

---

## 📋 Prérequis

- Un compte [GitHub](https://github.com) (gratuit)
- Un compte [Vercel](https://vercel.com) (gratuit — connectez-vous avec GitHub)
- Un compte [Supabase](https://supabase.com) (gratuit — connectez-vous avec GitHub)

---

## ÉTAPE 1 — Préparer le code sur GitHub (5 min)

### Option A : Télécharger le code (le plus simple)

1. Dans votre environnement de dev, exportez tout le dossier du projet en ZIP
2. Sur GitHub, créez un nouveau repository `yaa-commerce` (privé ou public)
3. Uploadez tous les fichiers via l'interface web GitHub (drag & drop)

### Option B : Via Git en ligne de commande

```bash
# Initialisez git si pas déjà fait
git init
git add .
git commit -m "YAA Commerce — landing + admin dashboard"

# Connectez votre repo GitHub
git remote add origin https://github.com/VOTRE-USERNAME/yaa-commerce.git
git branch -M main
git push -u origin main
```

⚠️ **Avant de push, vérifiez que `.gitignore` contient bien :**
```
node_modules
.next
.env.local
.env
```

---

## ÉTAPE 2 — Créer la base de données Supabase (5 min)

1. Allez sur [supabase.com](https://supabase.com) → **New Project**
2. Remplissez :
   - **Name** : `yaa-commerce`
   - **Database Password** : générez un mot de passe fort, notez-le
   - **Region** : `Frankfurt` (le plus proche de l'Afrique de l'Ouest)
   - **Plan** : Free
3. Cliquez **Create new project** (patientez ~2 min)

### Récupérer les clés API

1. Allez dans **Project Settings** (⚙️ en bas à gauche) → **API**
2. Notez ces 3 valeurs :
   - `Project URL` → `https://xxxxx.supabase.co`
   - `anon public` key
   - `service_role` key (gardez-la secrète !)

### Créer le schéma de base de données

1. Allez dans **SQL Editor** → **New query**
2. Collez ce SQL et cliquez **Run** :

```sql
-- Profiles (utilisateurs YAA)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  phone text,
  boutique_name text,
  plan text default 'decouverte',
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Products
create table public.products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade,
  name text not null,
  sku text,
  category text,
  type text default 'physique',
  price integer not null,
  stock integer,
  sold integer default 0,
  status text default 'actif',
  created_at timestamp with time zone default now()
);

-- Orders
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade,
  customer_name text not null,
  customer_phone text,
  customer_city text,
  items jsonb,
  amount integer not null,
  payment_method text,
  status text default 'nouveau',
  created_at timestamp with time zone default now()
);

-- Contact messages
create table public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  subject text,
  boutique_name text,
  message text not null,
  created_at timestamp with time zone default now()
);

-- Activer Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.contact_messages enable row level security;

-- Policies : chaque user ne voit que ses propres données
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can CRUD own products" on public.products for all using (auth.uid() = user_id);
create policy "Users can CRUD own orders" on public.orders for all using (auth.uid() = user_id);
-- Contact messages : tout le monde peut insérer, seul l'admin peut lire
create policy "Anyone can insert contact" on public.contact_messages for insert with check (true);
```

---

## ÉTAPE 3 — Déployer sur Vercel (5 min)

1. Allez sur [vercel.com](https://vercel.com) → **Add New Project**
2. Importez votre repo `yaa-commerce`
3. **Framework Preset** : Next.js (auto-détecté)
4. **Root Directory** : laissez par défaut
5. **Build Command** : `next build` (auto)
6. **Output Directory** : `.next` (auto)
7. NE CLIQUEZ PAS TOUT DE SUITE SUR DEPLOY — d'abord les variables d'environnement :

### Variables d'environnement à ajouter

Cliquez **Environment Variables** et ajoutez chacune :

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` (votre URL Supabase) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | votre clé anon Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | votre clé service_role Supabase |
| `NEXT_PUBLIC_APP_URL` | `https://yaa-commerce.vercel.app` (votre future URL Vercel) |
| `CONTACT_EMAIL` | `contact@yaa-commerce.com` |

8. Cliquez **Deploy** → patientez ~2-3 min
9. Vercel vous donne votre URL : `https://yaa-commerce-xxx.vercel.app`

---

## ÉTAPE 4 — Tester le site en production (2 min)

1. Ouvrez votre URL Vercel
2. Vérifiez que la landing page s'affiche
3. Testez les boutons :
   - "Créer ma boutique" → page `/signup`
   - "Se connecter" → page `/login`
   - "Voir une démo" → page `/demo` → `/admin`
   - "Contact" → page `/contact` (le formulaire doit s'envoyer)
4. Naviguez dans le dashboard admin (`/admin`)
5. Activez le dark mode (icône lune/soleil)

---

## ÉTAPE 5 — Connecter un domaine personnalisé (optionnel, 5 min)

1. Achetez un domaine (ex: `yaa-commerce.com`) sur Namecheap, GoDaddy, ou Gandi
2. Dans Vercel : **Settings** → **Domains** → ajoutez votre domaine
3. Chez votre registrar, ajoutez les DNS :
   - Type `A` : `76.76.21.21`
   - Type `CNAME` : `cname.vercel-dns.com` (pour `www`)
4. Patientez 24-48h pour la propagation DNS
5. Vercel active automatiquement le certificat SSL

---

## 🎯 Inviter vos premiers utilisateurs de test

### Méthode 1 : Partagez le lien Vercel

Donnez simplement votre URL Vercel à 5-10 utilisateurs de test :
```
https://yaa-commerce-xxx.vercel.app
```

### Méthode 2 : Créer des comptes dans Supabase

1. Dans Supabase → **Authentication** → **Users** → **Add user**
2. Ajoutez les emails de vos testeurs
3. Ils recevront une invitation par email

---

## 🔧 Prochaines étapes (post-déploiement)

Une fois le test validé :

1. **Brancher l'authentification réelle** : remplacer le fake login par Supabase Auth (cf. `src/lib/supabase.ts` à créer)
2. **Remplacer les données mock** : connecter les pages admin aux vraies tables Supabase
3. **Activer les paiements** : configurer Wave, Orange Money, MTN MoMo webhooks
4. **WhatsApp Business API** : demander l'accès sur Meta Business
5. **Analytics** : brancher Plausible ou Umami (gratuit, privacy-first)

---

## 🆘 Dépannage

### Le build échoue sur Vercel
- Vérifiez les logs dans Vercel → **Deployments** → cliquez sur le build
- Erreur courante : variable d'environnement manquante → ajoutez-la dans Vercel Settings

### La page /admin retourne 404
- Vérifiez que le dossier `src/app/admin/` est bien dans le repo GitHub
- Vérifiez que `src/app/admin/layout.tsx` et `src/app/admin/page.tsx` existent

### Erreur Supabase "Invalid API key"
- Vérifiez que vous avez bien copié la clé `anon` (pas `service_role`)
- Vérifiez que l'URL ne finit pas par `/`

### Le formulaire de contact ne s'envoie pas
- Le formulaire est simulé pour l'instant (toast de succès)
- Pour activer l'envoi réel : créer une API route `/api/contact` qui insère dans Supabase `contact_messages`

---

## 📞 Support

- **Vercel docs** : [vercel.com/docs](https://vercel.com/docs)
- **Supabase docs** : [supabase.com/docs](https://supabase.com/docs)
- **Next.js docs** : [nextjs.org/docs](https://nextjs.org/docs)

Bon déploiement ! 🚀

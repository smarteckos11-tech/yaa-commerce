// ============================================================
// YAA ADMIN — Mock data
// All amounts in FCFA, formatted fr-FR
// ============================================================

export const formatFCFA = (n: number) =>
  n.toLocaleString("fr-FR") + " FCFA";

export const formatNumber = (n: number) => n.toLocaleString("fr-FR");

// ---------- NAVIGATION ----------
export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type NavItem = {
  label: string;
  href: string;
  icon: string; // lucide icon name
  badge?: { text: string; variant: "green" | "orange" };
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { label: "Tableau de Bord", href: "/admin", icon: "LayoutDashboard" },
      { label: "Produits", href: "/admin/produits", icon: "Package" },
      { label: "Commandes", href: "/admin/commandes", icon: "ShoppingCart", badge: { text: "12", variant: "green" } },
      { label: "Clients", href: "/admin/clients", icon: "Users" },
      { label: "Paiements", href: "/admin/paiements", icon: "CreditCard" },
      { label: "WhatsApp Commerce", href: "/admin/whatsapp", icon: "MessageCircle", badge: { text: "Nouveau", variant: "orange" } },
      { label: "Livraisons", href: "/admin/livraisons", icon: "Truck" },
      { label: "Marketing", href: "/admin/marketing", icon: "Megaphone" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "IA YaaMind", href: "/admin/yaamind", icon: "Brain" },
      { label: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
    ],
  },
  {
    label: "Extensions",
    items: [
      { label: "MCP Connecteurs", href: "/admin/mcp", icon: "Plug" },
      { label: "Marketplace", href: "/admin/marketplace", icon: "Store" },
    ],
  },
  {
    label: "Système",
    items: [
      { label: "Super Admin", href: "/admin/super-admin", icon: "ShieldCheck" },
      { label: "Messages", href: "/admin/messages", icon: "Mail" },
    ],
  },
];

// ---------- DASHBOARD ----------
export const DASHBOARD_STATS = [
  { label: "Revenus du jour", value: 2450000, format: "fcfa", delta: "+16.8%", trend: "up" as const, color: "green" as const, icon: "Wallet" },
  { label: "Commandes", value: 128, format: "number", delta: "+12.5%", trend: "up" as const, color: "orange" as const, icon: "ShoppingCart" },
  { label: "COD à encaisser", value: 214000, format: "fcfa", delta: "3 en attente", trend: "up" as const, color: "rose" as const, icon: "Banknote" },
  { label: "Clients actifs", value: 356, format: "number", delta: "+15.7%", trend: "up" as const, color: "blue" as const, icon: "Users" },
];

export const RECENT_ORDERS = [
  { id: "CMD-2841", client: "Aminata Touré", city: "Abidjan", amount: 45000, status: "Livré" as const },
  { id: "CMD-2840", client: "Ibrahim Koné", city: "Bamako", amount: 125000, status: "En cours" as const },
  { id: "CMD-2839", client: "Fatou Diop", city: "Dakar", amount: 28500, status: "Livré" as const },
  { id: "CMD-2838", client: "Kwame Mensah", city: "Accra", amount: 78000, status: "En attente" as const },
  { id: "CMD-2837", client: "Aïcha Bello", city: "Cotonou", amount: 32000, status: "Livré" as const },
];

// ---------- PRODUCTS ----------
export type Product = {
  id: string;
  name: string;
  sku: string;
  category: "Mode" | "Artisanat" | "Beauté" | "Digital" | "Alimentation" | "Mobilier" | "Musique";
  type: "physique" | "digital";
  price: number;
  stock: number | null; // null = infinite (digital)
  sold: number;
  status: "Actif" | "Inactif" | "Brouillon";
  emoji: string;
};

export const PRODUCTS: Product[] = [
  { id: "P-001", name: "Boubou royal brodé", sku: "MOD-BR-001", category: "Mode", type: "physique", price: 45000, stock: 24, sold: 156, status: "Actif", emoji: "👔" },
  { id: "P-002", name: "Sac en cuir Faso Dan Fani", sku: "ART-SC-002", category: "Artisanat", type: "physique", price: 28000, stock: 8, sold: 89, status: "Actif", emoji: "👜" },
  { id: "P-003", name: "Beurre de karité bio 250g", sku: "BEA-BK-003", category: "Beauté", type: "physique", price: 8500, stock: 156, sold: 423, status: "Actif", emoji: "🧴" },
  { id: "P-004", name: "Formation E-commerce Africa", sku: "DIG-FE-004", category: "Digital", type: "digital", price: 75000, stock: null, sold: 234, status: "Actif", emoji: "🎓" },
  { id: "P-005", name: "Café Arabica Man 1kg", sku: "ALI-CA-005", category: "Alimentation", type: "physique", price: 12000, stock: 5, sold: 312, status: "Actif", emoji: "☕" },
  { id: "P-006", name: "Tabouret sculpté Ivoirien", sku: "MOB-TS-006", category: "Mobilier", type: "physique", price: 38000, stock: 12, sold: 47, status: "Actif", emoji: "🪑" },
  { id: "P-007", name: "Djembe professionnel", sku: "MUS-DJ-007", category: "Musique", type: "physique", price: 65000, stock: 3, sold: 28, status: "Actif", emoji: "🥁" },
  { id: "P-008", name: "Pagne wax premium 6 yards", sku: "MOD-PW-008", category: "Mode", type: "physique", price: 18000, stock: 89, sold: 245, status: "Actif", emoji: "👗" },
  { id: "P-009", name: "Savon noir africain", sku: "BEA-SN-009", category: "Beauté", type: "physique", price: 4500, stock: 234, sold: 567, status: "Actif", emoji: "🧼" },
  { id: "P-010", name: "E-book Recettes Africaines", sku: "DIG-EB-010", category: "Digital", type: "digital", price: 15000, stock: null, sold: 178, status: "Actif", emoji: "📚" },
];

export const PRODUCT_STATS = [
  { label: "Total", value: 342, color: "green" as const, icon: "Package" },
  { label: "Actifs", value: 289, color: "orange" as const, icon: "CheckCircle2" },
  { label: "Stock Faible", value: 23, color: "red" as const, icon: "AlertTriangle" },
  { label: "Digitals", value: 54, color: "purple" as const, icon: "Download" },
];

export const PRODUCT_CATEGORIES = ["Toutes", "Mode", "Artisanat", "Beauté", "Digital", "Alimentation", "Mobilier", "Musique"];

// Category color mapping
export const CATEGORY_COLORS: Record<Product["category"], { bg: string; text: string; ring: string }> = {
  Mode: { bg: "bg-rose-100 dark:bg-rose-950/50", text: "text-rose-700 dark:text-rose-300", ring: "ring-rose-200 dark:ring-rose-900" },
  Artisanat: { bg: "bg-amber-100 dark:bg-amber-950/50", text: "text-amber-700 dark:text-amber-300", ring: "ring-amber-200 dark:ring-amber-900" },
  Beauté: { bg: "bg-emerald-100 dark:bg-emerald-950/50", text: "text-emerald-700 dark:text-emerald-300", ring: "ring-emerald-200 dark:ring-emerald-900" },
  Digital: { bg: "bg-violet-100 dark:bg-violet-950/50", text: "text-violet-700 dark:text-violet-300", ring: "ring-violet-200 dark:ring-violet-900" },
  Alimentation: { bg: "bg-orange-100 dark:bg-orange-950/50", text: "text-orange-700 dark:text-orange-300", ring: "ring-orange-200 dark:ring-orange-900" },
  Mobilier: { bg: "bg-sky-100 dark:bg-sky-950/50", text: "text-sky-700 dark:text-sky-300", ring: "ring-sky-200 dark:ring-sky-900" },
  Musique: { bg: "bg-pink-100 dark:bg-pink-950/50", text: "text-pink-700 dark:text-pink-300", ring: "ring-pink-200 dark:ring-pink-900" },
};

// ---------- ORDERS (KANBAN) ----------
export type OrderStatus = "Nouveau" | "En préparation" | "Expédié" | "Livré" | "Annulé";
export type PaymentMethod = "Wave" | "Orange Money" | "MTN MoMo" | "Moov" | "Carte bancaire" | "Paiement à la livraison";

export const PAYMENT_COLORS: Record<PaymentMethod, { bg: string; text: string; dot: string }> = {
  "Wave": { bg: "bg-sky-100 dark:bg-sky-950/50", text: "text-sky-700 dark:text-sky-300", dot: "#1DC7EA" },
  "Orange Money": { bg: "bg-orange-100 dark:bg-orange-950/50", text: "text-orange-700 dark:text-orange-300", dot: "#FF6600" },
  "MTN MoMo": { bg: "bg-yellow-100 dark:bg-yellow-950/50", text: "text-yellow-700 dark:text-yellow-300", dot: "#FFCC00" },
  "Moov": { bg: "bg-blue-100 dark:bg-blue-950/50", text: "text-blue-700 dark:text-blue-300", dot: "#00A0E3" },
  "Carte bancaire": { bg: "bg-purple-100 dark:bg-purple-950/50", text: "text-purple-700 dark:text-purple-300", dot: "#8B5CF6" },
  "Paiement à la livraison": { bg: "bg-yaa-green-100 dark:bg-yaa-green-950/50", text: "text-yaa-green-700 dark:text-yaa-green-300", dot: "#0F8A5F" },
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, { border: string; bg: string; text: string; dot: string }> = {
  "Nouveau": { border: "border-sky-500", bg: "bg-sky-100 dark:bg-sky-950/50", text: "text-sky-700 dark:text-sky-300", dot: "bg-sky-500" },
  "En préparation": { border: "border-amber-500", bg: "bg-amber-100 dark:bg-amber-950/50", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  "Expédié": { border: "border-violet-500", bg: "bg-violet-100 dark:bg-violet-950/50", text: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500" },
  "Livré": { border: "border-yaa-green-500", bg: "bg-yaa-green-50 dark:bg-yaa-green-950/50", text: "text-yaa-green-700 dark:text-yaa-green-300", dot: "bg-yaa-green-500" },
  "Annulé": { border: "border-rose-500", bg: "bg-rose-100 dark:bg-rose-950/50", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
};

export type Order = {
  id: string;
  customer: string;
  city: string;
  country: string;
  items: string;
  amount: number;
  payment: PaymentMethod;
  time: string;
  avatar: string;
};

export const KANBAN_COLUMNS: { status: OrderStatus; orders: Order[] }[] = [
  {
    status: "Nouveau",
    orders: [
      { id: "CMD-2842", customer: "Mariam Sow", city: "Dakar", country: "Sénégal", items: "Sac cuir Faso Dan Fani ×1, Café Arabica ×2", amount: 52000, payment: "Wave", time: "Il y a 12 min", avatar: "MS" },
      { id: "CMD-2843", customer: "Sékou Traoré", city: "Bamako", country: "Mali", items: "Boubou royal brodé ×1", amount: 45000, payment: "Paiement à la livraison", time: "Il y a 25 min", avatar: "ST" },
      { id: "CMD-2844", customer: "Grace Adeyemi", city: "Lagos", country: "Nigeria", items: "Beurre karité ×3, Savon noir ×5", amount: 48000, payment: "MTN MoMo", time: "Il y a 38 min", avatar: "GA" },
      { id: "CMD-2845", customer: "Omar Ndiaye", city: "Abidjan", country: "Côte d'Ivoire", items: "Formation E-commerce Africa", amount: 75000, payment: "Paiement à la livraison", time: "Il y a 52 min", avatar: "ON" },
    ],
  },
  {
    status: "En préparation",
    orders: [
      { id: "CMD-2838", customer: "Kwame Mensah", city: "Accra", country: "Ghana", items: "Djembe professionnel ×1, Pagne wax ×2", amount: 101000, payment: "Carte bancaire", time: "Il y a 2h", avatar: "KM" },
      { id: "CMD-2839", customer: "Fatou Diop", city: "Dakar", country: "Sénégal", items: "Tabouret sculpté ×1", amount: 38000, payment: "Orange Money", time: "Il y a 3h", avatar: "FD" },
      { id: "CMD-2840", customer: "Ibrahim Koné", city: "Bamako", country: "Mali", items: "Café Arabica ×5, Beurre karité ×4", amount: 94000, payment: "Paiement à la livraison", time: "Il y a 4h", avatar: "IK" },
    ],
  },
  {
    status: "Expédié",
    orders: [
      { id: "CMD-2835", customer: "Aïcha Bello", city: "Cotonou", country: "Bénin", items: "Pagne wax premium ×3", amount: 54000, payment: "MTN MoMo", time: "Hier 18:30", avatar: "AB" },
      { id: "CMD-2836", customer: "Yao Kouassi", city: "Abidjan", country: "Côte d'Ivoire", items: "E-book Recettes Africaines", amount: 15000, payment: "Wave", time: "Hier 16:45", avatar: "YK" },
    ],
  },
  {
    status: "Livré",
    orders: [
      { id: "CMD-2831", customer: "Aminata Touré", city: "Abidjan", country: "Côte d'Ivoire", items: "Sac cuir ×1, Beurre karité ×2", amount: 45000, payment: "Orange Money", time: "Hier 14:20", avatar: "AT" },
      { id: "CMD-2832", customer: "Boubacar Sy", city: "Dakar", country: "Sénégal", items: "Boubou royal ×2", amount: 90000, payment: "Wave", time: "Hier 11:00", avatar: "BS" },
      { id: "CMD-2833", customer: "Linda Mbeki", city: "Accra", country: "Ghana", items: "Savon noir ×10, Beurre karité ×5", amount: 67500, payment: "Paiement à la livraison", time: "Lun 18:45", avatar: "LM" },
      { id: "CMD-2834", customer: "Moussa Camara", city: "Conakry", country: "Guinée", items: "Djembe pro ×1, Tabouret sculpté ×1", amount: 103000, payment: "Orange Money", time: "Lun 15:30", avatar: "MC" },
    ],
  },
  {
    status: "Annulé",
    orders: [
      { id: "CMD-2828", customer: "Awa Diallo", city: "Bamako", country: "Mali", items: "Formation E-commerce Africa", amount: 75000, payment: "Moov", time: "Lun 09:15", avatar: "AD" },
    ],
  },
];

// COD (Cash on Delivery) — orders awaiting cash collection by delivery drivers
export type CodStatus = "a_collecter" | "collecte" | "non_collecte" | "reconcilie";

export type CodOrder = {
  orderId: string;
  customer: string;
  city: string;
  carrier: string;
  amountToCollect: number;
  status: CodStatus;
  collectedAt?: string;
  collectedBy?: string;
  discrepancy?: number; // écart collecté vs attendu
};

export const COD_ORDERS: CodOrder[] = [
  { orderId: "CMD-2843", customer: "Sékou Traoré", city: "Bamako", carrier: "Coursier Local", amountToCollect: 45000, status: "a_collecter" },
  { orderId: "CMD-2845", customer: "Omar Ndiaye", city: "Abidjan", carrier: "Yango", amountToCollect: 75000, status: "a_collecter" },
  { orderId: "CMD-2840", customer: "Ibrahim Koné", city: "Bamako", carrier: "DHL", amountToCollect: 94000, status: "a_collecter" },
  { orderId: "CMD-2833", customer: "Linda Mbeki", city: "Accra", carrier: "Yango", amountToCollect: 67500, status: "collecte", collectedAt: "24 Jun 14:32", collectedBy: "Moussa K. (Yango)", discrepancy: 0 },
  { orderId: "CMD-2826", customer: "Awa Bello", city: "Cotonou", carrier: "Coursier Local", amountToCollect: 32000, status: "non_collecte", collectedAt: "23 Jun 17:20", collectedBy: "Ibrahim S. (Coursier)", discrepancy: 32000 },
  { orderId: "CMD-2822", customer: "Koffi Amani", city: "Abidjan", carrier: "Yango", amountToCollect: 58000, status: "reconcilie", collectedAt: "22 Jun 11:00", collectedBy: "Yao D. (Yango)", discrepancy: 0 },
];

export const COD_STATS = {
  totalToCollect: 214000,        // somme à collecter (a_collecter)
  totalCollected: 125500,        // somme collectée (collecte)
  totalDiscrepancy: 32000,       // écart total
  totalReconciled: 58000,        // réconcilié en banque
  pendingOrders: 3,              // commandes en attente de collecte
};

export const ORDER_SUMMARY = [
  { status: "Nouveau" as const, count: 4, total: 220000, color: "blue" },
  { status: "En préparation" as const, count: 3, total: 233000, color: "amber" },
  { status: "Expédié" as const, count: 2, total: 69000, color: "purple" },
  { status: "Livré" as const, count: 4, total: 305500, color: "green" },
  { status: "Annulé" as const, count: 1, total: 75000, color: "red" },
];

// ---------- CUSTOMERS ----------
export type Customer = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  city: string;
  country: string;
  avatar: string;
  totalSpent: number;
  orders: number;
  loyalty: number; // 0-100
  segment: "VIP" | "Régulier" | "Actif" | "Nouveau";
  lastOrder: string;
};

export const CUSTOMERS: Customer[] = [
  { id: "C-001", name: "Aminata Touré", email: "aminata.t@gmail.com", whatsapp: "+225 07 12 34 56", city: "Abidjan", country: "Côte d'Ivoire", avatar: "AT", totalSpent: 245000, orders: 18, loyalty: 92, segment: "VIP", lastOrder: "Aujourd'hui" },
  { id: "C-002", name: "Boubacar Sy", email: "bsy@gmail.com", whatsapp: "+221 77 123 45 67", city: "Dakar", country: "Sénégal", avatar: "BS", totalSpent: 189000, orders: 14, loyalty: 88, segment: "VIP", lastOrder: "Hier" },
  { id: "C-003", name: "Fatou Diop", email: "fatou.diop@gmail.com", whatsapp: "+221 76 987 65 43", city: "Dakar", country: "Sénégal", avatar: "FD", totalSpent: 134000, orders: 11, loyalty: 76, segment: "Régulier", lastOrder: "Il y a 2j" },
  { id: "C-004", name: "Kwame Mensah", email: "kwame.m@gmail.com", whatsapp: "+233 24 567 89 01", city: "Accra", country: "Ghana", avatar: "KM", totalSpent: 98000, orders: 8, loyalty: 65, segment: "Régulier", lastOrder: "Il y a 3j" },
  { id: "C-005", name: "Aïcha Bello", email: "aicha.bello@gmail.com", whatsapp: "+229 96 11 22 33", city: "Cotonou", country: "Bénin", avatar: "AB", totalSpent: 67000, orders: 6, loyalty: 58, segment: "Actif", lastOrder: "Il y a 5j" },
  { id: "C-006", name: "Ibrahim Koné", email: "ibrahim.k@gmail.com", whatsapp: "+223 76 12 34 56", city: "Bamako", country: "Mali", avatar: "IK", totalSpent: 56000, orders: 5, loyalty: 52, segment: "Actif", lastOrder: "Il y a 1sem" },
  { id: "C-007", name: "Grace Adeyemi", email: "grace.adeyemi@gmail.com", whatsapp: "+234 803 123 45 67", city: "Lagos", country: "Nigeria", avatar: "GA", totalSpent: 42000, orders: 4, loyalty: 45, segment: "Actif", lastOrder: "Il y a 1sem" },
  { id: "C-008", name: "Moussa Camara", email: "moussa.c@gmail.com", whatsapp: "+224 622 33 44 55", city: "Conakry", country: "Guinée", avatar: "MC", totalSpent: 31000, orders: 3, loyalty: 32, segment: "Nouveau", lastOrder: "Il y a 2sem" },
  { id: "C-009", name: "Linda Mbeki", email: "linda.m@gmail.com", whatsapp: "+233 27 999 88 77", city: "Accra", country: "Ghana", avatar: "LM", totalSpent: 18500, orders: 2, loyalty: 24, segment: "Nouveau", lastOrder: "Il y a 3sem" },
  { id: "C-010", name: "Omar Ndiaye", email: "omar.n@gmail.com", whatsapp: "+225 05 89 67 43", city: "Abidjan", country: "Côte d'Ivoire", avatar: "ON", totalSpent: 12000, orders: 1, loyalty: 12, segment: "Nouveau", lastOrder: "Aujourd'hui" },
];

export const CUSTOMER_STATS = [
  { label: "Total Clients", value: 1247, color: "green" as const, icon: "Users" },
  { label: "VIP", value: 186, color: "amber" as const, icon: "Crown" },
  { label: "Dépenses Moyennes", value: 38250, format: "fcfa", color: "orange" as const, icon: "Wallet" },
  { label: "Taux Rétention", value: 73, format: "percent", color: "rose" as const, icon: "RefreshCw" },
];

export const CUSTOMER_SEGMENTS = ["Tous", "VIP", "Régulier", "Actif", "Nouveau"];
export const CUSTOMER_COUNTRIES = ["Tous", "Côte d'Ivoire", "Sénégal", "Ghana", "Mali", "Nigeria", "Bénin"];

export const SEGMENT_COLORS = {
  VIP: { bg: "bg-amber-100 dark:bg-amber-950/50", text: "text-amber-700 dark:text-amber-300" },
  Régulier: { bg: "bg-yaa-green-100 dark:bg-yaa-green-950/50", text: "text-yaa-green-700 dark:text-yaa-green-300" },
  Actif: { bg: "bg-sky-100 dark:bg-sky-950/50", text: "text-sky-700 dark:text-sky-300" },
  Nouveau: { bg: "bg-violet-100 dark:bg-violet-950/50", text: "text-violet-700 dark:text-violet-300" },
};

// ---------- PAYMENTS ----------
export type Provider = {
  name: string;
  type: string;
  country: string;
  connected: boolean;
  balance?: number;
  transactions?: number;
  color: string;
  initials: string;
};

export const PROVIDERS: Provider[] = [
  { name: "Wave", type: "Mobile Money", country: "Sénégal, Côte d'Ivoire", connected: true, balance: 1850000, transactions: 542, color: "#1DC7EA", initials: "W" },
  { name: "Orange Money", type: "Mobile Money", country: "Côte d'Ivoire, Mali", connected: true, balance: 1240000, transactions: 487, color: "#FF6600", initials: "OM" },
  { name: "MTN MoMo", type: "Mobile Money", country: "Ghana, Côte d'Ivoire", connected: true, balance: 890000, transactions: 312, color: "#FFCC00", initials: "MTN" },
  { name: "Moov Money", type: "Mobile Money", country: "Bénin, Burkina", connected: true, balance: 425000, transactions: 198, color: "#00A0E3", initials: "MV" },
  { name: "CinetPay", type: "Agrégateur", country: "Afrique de l'Ouest", connected: true, balance: 320000, transactions: 156, color: "#1B4D8C", initials: "CP" },
  { name: "Paiement à la livraison", type: "Cash (COD)", country: "Toute l'Afrique", connected: true, balance: 845000, transactions: 312, color: "#0F8A5F", initials: "COD" },
  { name: "PayDunya", type: "Agrégateur", country: "Sénégal", connected: false, color: "#1B9E77", initials: "PD" },
  { name: "Stripe", type: "Carte bancaire", country: "International", connected: false, color: "#635BFF", initials: "S" },
  { name: "PayPal", type: "Portefeuille", country: "International", connected: false, color: "#0070BA", initials: "PP" },
];

export const PAYMENT_STATS = [
  { label: "Solde Total", value: 4825000, format: "fcfa", color: "green" as const, icon: "Wallet" },
  { label: "Transactions", value: 1847, color: "orange" as const, icon: "CreditCard" },
  { label: "Mobile Money", value: 6, suffix: " connectés", color: "purple" as const, icon: "Smartphone" },
  { label: "Taux Succès", value: 96.2, format: "percent", color: "sky" as const, icon: "CheckCircle2" },
];

export type Transaction = {
  id: string;
  client: string;
  provider: PaymentMethod;
  amount: number;
  reference: string;
  status: "Réussi" | "En attente" | "Échec";
  date: string;
};

export const TRANSACTIONS: Transaction[] = [
  { id: "TX-9821", client: "Aminata Touré", provider: "Orange Money", amount: 45000, reference: "OM-784512", status: "Réussi", date: "24 Jun 2026, 14:32" },
  { id: "TX-9820", client: "Mariam Sow", provider: "Wave", amount: 52000, reference: "WV-452139", status: "Réussi", date: "24 Jun 2026, 14:18" },
  { id: "TX-9819", client: "Sékou Traoré", provider: "Orange Money", amount: 45000, reference: "OM-784489", status: "Réussi", date: "24 Jun 2026, 14:05" },
  { id: "TX-9818", client: "Grace Adeyemi", provider: "MTN MoMo", amount: 48000, reference: "MTN-321654", status: "Réussi", date: "24 Jun 2026, 13:52" },
  { id: "TX-9817", client: "Omar Ndiaye", provider: "Wave", amount: 75000, reference: "WV-451998", status: "En attente", date: "24 Jun 2026, 13:38" },
  { id: "TX-9816", client: "Kwame Mensah", provider: "Carte bancaire", amount: 101000, reference: "CB-998471", status: "Réussi", date: "24 Jun 2026, 12:45" },
  { id: "TX-9815", client: "Fatou Diop", provider: "Orange Money", amount: 38000, reference: "OM-784012", status: "Réussi", date: "24 Jun 2026, 11:30" },
  { id: "TX-9814", client: "Ibrahim Koné", provider: "Moov", amount: 94000, reference: "MV-110892", status: "Réussi", date: "24 Jun 2026, 10:15" },
  { id: "TX-9813", client: "Awa Diallo", provider: "Moov", amount: 75000, reference: "MV-110754", status: "Échec", date: "24 Jun 2026, 09:45" },
  { id: "TX-9812", client: "Aïcha Bello", provider: "MTN MoMo", amount: 54000, reference: "MTN-321001", status: "Réussi", date: "24 Jun 2026, 09:20" },
];

// ---------- WHATSAPP ----------
export const WHATSAPP_STATS = [
  { label: "Conversations", value: 892, color: "green" as const, icon: "MessageCircle" },
  { label: "Réponses IA", value: 2341, color: "orange" as const, icon: "Bot" },
  { label: "Conversion", value: 6.2, format: "percent", color: "emerald" as const, icon: "TrendingUp" },
  { label: "Revenus", value: 567000, format: "fcfa", color: "yellow" as const, icon: "Wallet" },
];

export type WhatsAppConversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  vip: boolean;
  avatar: string;
};

export const WHATSAPP_CONVERSATIONS: WhatsAppConversation[] = [
  { id: "W-1", name: "Mariam Sow", lastMessage: "Bonjour, le sac est dispo ?", time: "14:32", unread: 2, online: true, vip: true, avatar: "MS" },
  { id: "W-2", name: "Sékou Traoré", lastMessage: "Merci pour la commande 🙏", time: "13:45", unread: 0, online: true, vip: false, avatar: "ST" },
  { id: "W-3", name: "Grace Adeyemi", lastMessage: "Vous livrez à Lagos ?", time: "12:20", unread: 3, online: false, vip: true, avatar: "GA" },
  { id: "W-4", name: "Omar Ndiaye", lastMessage: "Le paiement est passé ✓", time: "11:15", unread: 0, online: true, vip: false, avatar: "ON" },
  { id: "W-5", name: "Awa Diallo", lastMessage: "Quels sont vos produits bio ?", time: "10:30", unread: 1, online: false, vip: false, avatar: "AD" },
];

export type ChatMessage = {
  id: string;
  sender: "boutique" | "client";
  text: string;
  time: string;
  iaSuggestion?: string;
};

export const CHAT_MESSAGES: ChatMessage[] = [
  { id: "M1", sender: "client", text: "Bonjour, j'ai vu votre sac en cuir Faso Dan Fani, est-il encore disponible ?", time: "14:28" },
  { id: "M2", sender: "boutique", text: "Bonjour Mariam ! Oui, il est disponible 🙏 Il est fait main à Ouagadougou, cuir véritable. Prix : 28 000 FCFA. Souhaitez-vous commander ?", time: "14:30" },
  { id: "M3", sender: "client", text: "Super ! Vous livrez à Dakar ? Et le paiement par Wave c'est possible ?", time: "14:31" },
  {
    id: "M4",
    sender: "boutique",
    text: "Oui, nous livrons à Dakar en 24h via Yango 🚚 Paiement Wave accepté ! Frais de livraison : 2 500 FCFA. Total : 30 500 FCFA. Je vous envoie le lien de paiement ?",
    time: "14:32",
    iaSuggestion: "Astuce IA : Proposez un code promo de 5% pour les nouveaux clients VIP afin d'augmenter la conversion (+18% observé sur ce segment).",
  },
];

export const WHATSAPP_CATALOG = [
  { emoji: "🧥", name: "Boubou Royal", category: "Mode", price: 45000, stock: 24 },
  { emoji: "👗", name: "Pagne Wax Premium", category: "Mode", price: 18000, stock: 89 },
  { emoji: "👶", name: "Tenue Enfant Brodée", category: "Mode", price: 15000, stock: 12 },
  { emoji: "👞", name: "Mocassins Cuir", category: "Mode", price: 32000, stock: 8 },
  { emoji: "👜", name: "Sac Faso Dan Fani", category: "Artisanat", price: 28000, stock: 8 },
  { emoji: "🎭", name: "Masque Traditionnel", category: "Artisanat", price: 55000, stock: 4 },
];

export const AUTO_REPLIES = [
  { trigger: "bonjour", match: "contient", reply: "Bonjour 👋 Bienvenue chez YAA Boutique ! Comment puis-je vous aider aujourd'hui ? Vous pouvez consulter notre catalogue en tapant CATALOGUE." },
  { trigger: "prix", match: "contient", reply: "Voici nos meilleurs prix du moment ! Tous nos produits sont affichés en FCFA. Paiement Wave, Orange Money, MTN MoMo acceptés. Tapez COMMANDE pour commander." },
  { trigger: "livraison", match: "contient", reply: "🚚 Nous livrons à Abidjan en 2h, partout en Côte d'Ivoire en 24h. Frais calculés automatiquement. Suivi en temps réel inclus !" },
  { trigger: "paiement", match: "contient", reply: "💳 Nous acceptons Wave, Orange Money, MTN MoMo, Moov Money et cartes bancaires. Paiement 100% sécurisé via YAA." },
  { trigger: "catalogue", match: "exact", reply: "Voici notre catalogue complet 📚 [Lien catalogue]. Dites-moi quel produit vous intéresse !" },
  { trigger: "merci", match: "contient", reply: "Avec plaisir 🙏 N'hésitez pas si vous avez d'autres questions. Merci pour votre confiance !" },
];

export const WHATSAPP_CAMPAIGNS = [
  { name: "Promo Tabaski 2026", status: "Active", sent: 1247, delivered: 1198, opened: 856, clicked: 412, revenue: 458000 },
  { name: "Nouveautés Mode", status: "Active", sent: 892, delivered: 856, opened: 612, clicked: 287, revenue: 234000 },
  { name: "Braderie Beauté", status: "Terminée", sent: 1567, delivered: 1502, opened: 987, clicked: 445, revenue: 567000 },
];

// ---------- DELIVERY ----------
export const DELIVERY_STATS = [
  { label: "En transit", value: 23, color: "orange" as const, icon: "Truck" },
  { label: "Livrées", value: 135, color: "green" as const, icon: "CheckCircle2" },
  { label: "Délai moyen", value: 3.2, suffix: " jours", color: "blue" as const, icon: "Clock" },
  { label: "Taux livraison", value: 97.8, format: "percent", color: "emerald" as const, icon: "TrendingUp" },
];

export type Shipment = {
  id: string;
  customer: string;
  from: string;
  to: string;
  carrier: "Yango" | "DHL" | "Coursier Local" | "FedEx";
  tracking: string;
  status: "En transit" | "Livré" | "En préparation" | "Retourné";
  eta: string;
  fee: number;
  codAmount?: number;       // montant cash à collecter (si COD)
  codStatus?: CodStatus;    // statut COD
};

export const SHIPMENTS: Shipment[] = [
  { id: "SHP-9821", customer: "Mariam Sow", from: "Abidjan", to: "Dakar", carrier: "Yango", tracking: "YNG-784512", status: "En transit", eta: "Demain 12h", fee: 3500 },
  { id: "SHP-9820", customer: "Sékou Traoré", from: "Abidjan", to: "Bamako", carrier: "DHL", tracking: "DHL-452139", status: "En transit", eta: "26 Jun 18h", fee: 8500, codAmount: 45000, codStatus: "a_collecter" },
  { id: "SHP-9819", customer: "Grace Adeyemi", from: "Abidjan", to: "Lagos", carrier: "FedEx", tracking: "FDX-321654", status: "En préparation", eta: "27 Jun 14h", fee: 12000 },
  { id: "SHP-9818", customer: "Kwame Mensah", from: "Abidjan", to: "Accra", carrier: "Yango", tracking: "YNG-451998", status: "Livré", eta: "Livré 23 Jun", fee: 2500 },
  { id: "SHP-9817", customer: "Fatou Diop", from: "Abidjan", to: "Dakar", carrier: "DHL", tracking: "DHL-784012", status: "Livré", eta: "Livré 22 Jun", fee: 7500, codAmount: 38000, codStatus: "collecte" },
  { id: "SHP-9816", customer: "Ibrahim Koné", from: "Abidjan", to: "Bamako", carrier: "Coursier Local", tracking: "CSL-110892", status: "Retourné", eta: "N/A", fee: 5000, codAmount: 94000, codStatus: "non_collecte" },
];

export const CARRIERS = [
  { name: "Yango", color: "#E11D48", coverage: "Abidjan, Dakar, Accra, Lagos", deliveries: 487, rating: 4.8, delay: "2h - 24h", price: "1 500 - 5 000 FCFA" },
  { name: "DHL", color: "#D40511", coverage: "International + grandes villes", deliveries: 234, rating: 4.9, delay: "24h - 72h", price: "5 000 - 25 000 FCFA" },
  { name: "Coursier Local", color: "#0F8A5F", coverage: "Intérieur Côte d'Ivoire", deliveries: 312, rating: 4.6, delay: "24h - 72h", price: "2 000 - 8 000 FCFA" },
  { name: "FedEx", color: "#7D2C8C", coverage: "International express", deliveries: 89, rating: 4.7, delay: "48h - 96h", price: "8 000 - 30 000 FCFA" },
];

export const DELIVERY_CITIES_LIST = [
  "Abidjan", "Yamoussoukro", "Bouaké", "San-Pédro", "Daloa", "Korhogo", "Man", "Dakar", "Bamako", "Accra", "Lagos", "Cotonou",
];

export const CARRIER_BADGES = {
  Yango: { bg: "bg-rose-100 dark:bg-rose-950/50", text: "text-rose-700 dark:text-rose-300" },
  DHL: { bg: "bg-red-100 dark:bg-red-950/50", text: "text-red-700 dark:text-red-300" },
  "Coursier Local": { bg: "bg-yaa-green-100 dark:bg-yaa-green-950/50", text: "text-yaa-green-700 dark:text-yaa-green-300" },
  FedEx: { bg: "bg-purple-100 dark:bg-purple-950/50", text: "text-purple-700 dark:text-purple-300" },
};

// ---------- MARKETING ----------
export const MARKETING_CHANNELS = [
  { name: "Email", icon: "Mail", sent: 1247, opened: 856, color: "blue", rate: 68.6 },
  { name: "SMS", icon: "Smartphone", sent: 892, opened: 745, color: "green", rate: 83.5 },
  { name: "WhatsApp", icon: "MessageCircle", sent: 1567, opened: 1198, color: "emerald", rate: 76.5 },
  { name: "Push", icon: "Bell", sent: 678, opened: 312, color: "orange", rate: 46.0 },
];

export const MARKETING_CAMPAIGNS = [
  { name: "Promo Tabaski 2026", channel: "WhatsApp", status: "Active", sent: 1247, opened: 856, clicked: 412, revenue: 458000 },
  { name: "Braderie Beauté", channel: "SMS", status: "Active", sent: 892, opened: 745, clicked: 312, revenue: 234000 },
  { name: "Nouveautés Mode", channel: "Email", status: "Active", sent: 1567, opened: 1198, clicked: 567, revenue: 567000 },
  { name: "Black Friday", channel: "Push", status: "Planifiée", sent: 0, opened: 0, clicked: 0, revenue: 0 },
  { name: "Anniversaire Client", channel: "WhatsApp", status: "Active", sent: 234, opened: 198, clicked: 89, revenue: 124000 },
  { name: "Soldes Hiver", channel: "SMS", status: "Terminée", sent: 678, opened: 567, clicked: 234, revenue: 345000 },
];

export const MARKETING_SEGMENTS = [
  { emoji: "👑", name: "VIP Premium", description: "Clients ayant dépensé > 200 000 FCFA", clients: 186, revenue: 4250000, growth: "+24%" },
  { emoji: "🛒", name: "Acheteurs Récurrents", description: "Plus de 3 commandes sur 90 jours", clients: 342, revenue: 2840000, growth: "+18%" },
  { emoji: "🌟", name: "Nouveaux Clients", description: "Première commande < 30 jours", clients: 218, revenue: 1240000, growth: "+45%" },
  { emoji: "💤", name: "Inactifs", description: "Aucune commande depuis 60 jours", clients: 287, revenue: 0, growth: "-12%" },
  { emoji: "🔄", name: "Paniers Abandonnés", description: "Panier non finalisé < 7 jours", clients: 124, revenue: 890000, growth: "+8%" },
  { emoji: "💬", name: "Engagés WhatsApp", description: "Conversations actives < 7 jours", clients: 412, revenue: 1567000, growth: "+32%" },
];

export const AUTOMATIONS = [
  { name: "Bienvenue nouveau client", trigger: "nouveau_client", action: "Email de bienvenue + code promo -10%", executions: 218, active: true },
  { name: "Panier abandonné", trigger: "panier_abandonne", action: "WhatsApp relance + lien direct", executions: 124, active: true },
  { name: "Anniversaire client", trigger: "anniversaire", action: "Email personnalisé + offre spéciale", executions: 47, active: true },
  { name: "Recommandation IA", trigger: "commande_livree", action: "Suggestion produits similaires", executions: 312, active: true },
  { name: "Réactivation inactifs", trigger: "inactif_60j", action: "SMS promo réactivation", executions: 89, active: false },
];

// ---------- YAAMIND ----------
export const YAAMIND_MODELS = [
  { id: "gpt-4o", name: "GPT-4o", icon: "OpenAI" },
  { id: "claude-3-5", name: "Claude 3.5 Sonnet", icon: "Anthropic" },
  { id: "gemini-pro", name: "Gemini Pro", icon: "Google" },
  { id: "deepseek-v3", name: "DeepSeek V3", icon: "DeepSeek" },
];

export const YAAMIND_QUICK_ACTIONS = [
  { label: "Générer réponse client", icon: "MessageSquareReply", color: "green" },
  { label: "Idées produits", icon: "Lightbulb", color: "orange" },
  { label: "Analyser performances", icon: "TrendingUp", color: "blue" },
  { label: "Générer code promo", icon: "Ticket", color: "purple" },
  { label: "Optimiser SEO", icon: "Search", color: "emerald" },
  { label: "Auto-réponse WhatsApp", icon: "MessageCircle", color: "orange" },
];

export const YAAMIND_CHAT = [
  { id: "1", sender: "user" as const, text: "Aide-moi à rédiger une description SEO pour mon sac en cuir Faso Dan Fani.", time: "14:20" },
  {
    id: "2",
    sender: "assistant" as const,
    text: "Avec plaisir ! Voici une description optimisée SEO pour votre **Sac en cuir Faso Dan Fani** :\n\n**Sac à main artisanal Faso Dan Fani — Cuir véritable fait main**\n\nÉlégant sac à main en cuir véritable, fabriqué artisanalement au Burkina Faso. Motif traditionnel Faso Dan Fani tissé à la main, finitions soignées. Sac unique, parfait pour toutes vos occasions.\n\n**Caractéristiques :**\n• Cuir véritable pleine fleur\n• Motif Faso Dan Fani traditionnel\n• Fermeture éclair sécurisée\n• Bandoulière ajustable\n• Dimensions : 28 × 22 × 10 cm\n\n**Mots-clés SEO :** sac cuir africain, sac fait main, Faso Dan Fani, sac artisanal, maroquinerie africaine, sac ethnique.",
    time: "14:20",
  },
  {
    id: "3",
    sender: "assistant" as const,
    text: "",
    time: "14:21",
    iaSuggestion: "Voulez-vous que j'ajoute des hashtags Instagram et un script de post WhatsApp pour promouvoir ce produit ?",
  },
  { id: "4", sender: "user" as const, text: "Oui, génère aussi une campagne SMS.", time: "14:22" },
  {
    id: "5",
    sender: "assistant" as const,
    text: "Parfait ! Voici votre pack marketing complet :\n\n**📱 Hashtags Instagram :**\n#SacCuirAfricain #FasoDanFani #FaitMain #MaroquinerieAfricaine #ArtisanatBurkinabe #ModeAfricaine #SacArtisanal\n\n**💬 Script WhatsApp :**\n« 🛍️ NOUVEAUTÉ ! Sac en cuir Faso Dan Fani fait main ✨\n\n🎨 Motif traditionnel tissé à la main\n🐄 Cuir véritable pleine fleur\n📦 Livraison 24h Abidjan\n💳 Wave, Orange Money, MTN acceptés\n\nPrix : 28 000 FCFA\n👉 Commandez : [lien] »\n\n**📲 Campagne SMS :**\n« YAA Boutique : Découvrez notre nouveau sac Faso Dan Fani en cuir véritable ! 28 000 FCFA. Livraison 24h. Commandez : [lien] STOP=desabo »",
    time: "14:22",
  },
];

// ---------- ANALYTICS ----------
export const ANALYTICS_PREDICTIONS = [
  { label: "CA Juillet 2026", value: "8 450 000 FCFA", trend: "up", change: "+18.2%", confidence: 92, icon: "TrendingUp" },
  { label: "Commandes", value: "1 247", trend: "up", change: "+12.4%", confidence: 89, icon: "ShoppingCart" },
  { label: "Nouveaux Clients", value: "342", trend: "up", change: "+24.1%", confidence: 87, icon: "UserPlus" },
  { label: "Taux Conversion", value: "4.8%", trend: "down", change: "-0.3%", confidence: 84, icon: "Target" },
  { label: "Panier Moyen", value: "32 500 FCFA", trend: "up", change: "+5.7%", confidence: 91, icon: "ShoppingBag" },
];

export const REVENUE_CHART_DATA = [
  { month: "Oct", reel: 4200000, prevu: null },
  { month: "Nov", reel: 4800000, prevu: null },
  { month: "Déc", reel: 6200000, prevu: null },
  { month: "Jan", reel: 5400000, prevu: null },
  { month: "Fév", reel: 5800000, prevu: null },
  { month: "Mar", reel: 6900000, prevu: null },
  { month: "Avr", reel: 7100000, prevu: null },
  { month: "Mai", reel: 7450000, prevu: null },
  { month: "Jun", reel: 7820000, prevu: null },
  { month: "Juil", reel: null, prevu: 8450000 },
  { month: "Aoû", reel: null, prevu: 9120000 },
  { month: "Sep", reel: null, prevu: 9780000 },
];

export const CONVERSION_FUNNEL = [
  { stage: "Visiteurs", value: 12450, color: "#0F8A5F" },
  { stage: "Vues Produits", value: 8234, color: "#34D399" },
  { stage: "Paniers", value: 2841, color: "#F97316" },
  { stage: "Checkouts", value: 1247, color: "#FB923C" },
  { stage: "Acheteurs", value: 892, color: "#0EA5E9" },
];

export const TRAFFIC_SOURCES = [
  { name: "WhatsApp", value: 40, color: "#0F8A5F" },
  { name: "Direct", value: 22, color: "#64748B" },
  { name: "Réseaux Sociaux", value: 17, color: "#F97316" },
  { name: "Google", value: 13, color: "#0EA5E9" },
  { name: "Référents", value: 8, color: "#94A3B8" },
];

export const TOP_CITIES = [
  { city: "Abidjan", revenue: 3450000, percent: 100 },
  { city: "Dakar", revenue: 2340000, percent: 68 },
  { city: "Accra", revenue: 1870000, percent: 54 },
  { city: "Lagos", revenue: 1450000, percent: 42 },
  { city: "Bamako", revenue: 980000, percent: 28 },
  { city: "Cotonou", revenue: 670000, percent: 19 },
];

// ---------- MCP CONNECTORS ----------
export const MCP_CONNECTORS = [
  { name: "Gmail", color: "#EA4335", category: "Email", connected: true, description: "Synchro emails clients + réponses automatiques", lastSync: "Il y a 5 min" },
  { name: "Google Calendar", color: "#4285F4", category: "Calendrier", connected: true, description: "Rendez-vous clients + planification livraisons", lastSync: "Il y a 12 min" },
  { name: "Notion", color: "#000000", category: "Productivité", connected: false, description: "Wiki produits + base de connaissances", lastSync: "Jamais" },
  { name: "Slack", color: "#4A154B", category: "Communication", connected: true, description: "Notifications commandes + équipe support", lastSync: "Il y a 3 min" },
  { name: "Discord", color: "#5865F2", category: "Communication", connected: false, description: "Communauté clients + support live", lastSync: "Jamais" },
  { name: "WordPress", color: "#21759B", category: "CMS", connected: false, description: "Blog SEO + landing pages", lastSync: "Jamais" },
  { name: "Airtable", color: "#FCB400", category: "Base de données", connected: true, description: "Inventaire + gestion produits avancée", lastSync: "Il y a 8 min" },
  { name: "Google Drive", color: "#FFD04B", category: "Stockage", connected: true, description: "Sauvegarde photos produits + documents", lastSync: "Il y a 2 min" },
];

export const MCP_STATS = [
  { label: "Connectés", value: 4, suffix: "/8", color: "green" as const, icon: "Plug" },
  { label: "Synchronisations", value: 847, color: "orange" as const, icon: "RefreshCw" },
  { label: "Dernière sync", value: 5, suffix: " min", color: "blue" as const, icon: "Clock" },
];

// ---------- MARKETPLACE ----------
export const MARKETPLACE_CATEGORIES = [
  { name: "Paiements", emoji: "💳", count: 12 },
  { name: "Marketing", emoji: "📢", count: 18 },
  { name: "Livraison", emoji: "🚚", count: 8 },
  { name: "CRM", emoji: "👥", count: 14 },
  { name: "Analytics", emoji: "📊", count: 9 },
  { name: "Productivité", emoji: "⚡", count: 16 },
];

export const FEATURED_EXTENSIONS = [
  { name: "WhatsApp Business Pro", developer: "YAA Official", category: "Marketing", description: "Catalogue, auto-réponses IA, campagnes WhatsApp avancées", rating: 4.9, price: "Gratuit", installs: "12K", installed: true },
  { name: "Stripe Connect", developer: "Stripe Inc.", category: "Paiements", description: "Acceptez les paiements cartes bancaires internationaux", rating: 4.8, price: "2.9% + 100 FCFA", installs: "8.5K", installed: false },
  { name: "Klaviyo Email", developer: "Klaviyo", category: "Marketing", description: "Email marketing avancé avec segmentation IA", rating: 4.7, price: "À partir 5 000 FCFA/mois", installs: "6.2K", installed: false },
  { name: "DHL Express", developer: "DHL", category: "Livraison", description: "Livraison internationale express avec suivi", rating: 4.9, price: "Gratuit", installs: "4.8K", installed: true },
];

export const ALL_EXTENSIONS = [
  { name: "WhatsApp Business Pro", developer: "YAA Official", emoji: "💬", rating: 4.9, installs: "12K", price: "Gratuit", installed: true, category: "Marketing" },
  { name: "Stripe Connect", developer: "Stripe Inc.", emoji: "💳", rating: 4.8, installs: "8.5K", price: "2.9%", installed: false, category: "Paiements" },
  { name: "Klaviyo Email", developer: "Klaviyo", emoji: "📧", rating: 4.7, installs: "6.2K", price: "5 000 FCFA", installed: false, category: "Marketing" },
  { name: "DHL Express", developer: "DHL", emoji: "📦", rating: 4.9, installs: "4.8K", price: "Gratuit", installed: true, category: "Livraison" },
  { name: "HubSpot CRM", developer: "HubSpot", emoji: "🎯", rating: 4.6, installs: "3.4K", price: "15 000 FCFA", installed: false, category: "CRM" },
  { name: "Google Analytics 4", developer: "Google", emoji: "📊", rating: 4.8, installs: "9.8K", price: "Gratuit", installed: true, category: "Analytics" },
  { name: "Mailchimp", developer: "Intuit", emoji: "🐵", rating: 4.5, installs: "5.1K", price: "Gratuit", installed: false, category: "Marketing" },
  { name: "Notion Sync", developer: "Notion", emoji: "📝", rating: 4.7, installs: "2.8K", price: "Gratuit", installed: false, category: "Productivité" },
];

// ---------- SUPER ADMIN ----------
export const SUPER_ADMIN_STATS = [
  { label: "Utilisateurs", value: 2847, color: "blue" as const, icon: "Users" },
  { label: "Actifs", value: 1923, color: "green" as const, icon: "Activity" },
  { label: "MRR", value: 14250000, format: "fcfa", color: "orange" as const, icon: "Wallet" },
  { label: "Revenu Total", value: 28500000, format: "fcfa", color: "purple" as const, icon: "TrendingUp" },
  { label: "Commandes", value: 8456, color: "rose" as const, icon: "ShoppingCart" },
];

export const SUPER_ADMIN_USERS = [
  { name: "Moussa Diallo", email: "moussa@yaashop.ci", plan: "Pro", status: "Actif", mrr: 9900, date: "12 Jan 2026", avatar: "MD" },
  { name: "Aminata Touré", email: "amina@boutique.ci", plan: "Business", status: "Actif", mrr: 4900, date: "23 Fév 2026", avatar: "AT" },
  { name: "Ibrahim Koné", email: "ib@mall.ml", plan: "Business", status: "Essai", mrr: 0, date: "18 Jun 2026", avatar: "IK" },
  { name: "Fatou Diop", email: "fatou@mode.sn", plan: "Découverte", status: "Actif", mrr: 2900, date: "05 Mar 2026", avatar: "FD" },
  { name: "Kwame Mensah", email: "kwame@tech.gh", plan: "Pro", status: "Actif", mrr: 9900, date: "17 Nov 2025", avatar: "KM" },
  { name: "Aïcha Bello", email: "aicha@beauty.bj", plan: "Business", status: "Actif", mrr: 4900, date: "28 Avr 2026", avatar: "AB" },
  { name: "Omar Ndiaye", email: "omar@shop.ci", plan: "Découverte", status: "Suspendu", mrr: 0, date: "10 Mai 2026", avatar: "ON" },
  { name: "Grace Adeyemi", email: "grace@fashion.ng", plan: "Business", status: "Essai", mrr: 0, date: "22 Jun 2026", avatar: "GA" },
];

export const SUPER_ADMIN_PLANS = [
  {
    name: "Découverte",
    price: 2900,
    users: 1245,
    percent: 43,
    revenue: 3610500,
    popular: false,
    features: ["Boutique en ligne", "50 produits", "1 Mobile Money", "Support email"],
  },
  {
    name: "Business",
    price: 4900,
    users: 1089,
    percent: 38,
    revenue: 5336100,
    popular: true,
    features: ["Produits illimités", "Tous Mobile Money", "WhatsApp Business", "Analytics avancés", "Support prioritaire"],
  },
  {
    name: "Pro",
    price: 9900,
    users: 513,
    percent: 19,
    revenue: 5078700,
    popular: false,
    features: ["Multi-boutiques", "IA YaaMind", "API & Webhooks", "Gestionnaire dédié", "SLA 99.9%"],
  },
];

export const SUPER_ADMIN_ROLES = [
  { name: "Super Admin", count: 3, color: "red", permissions: ["Tous les droits", "Gestion utilisateurs", "Configuration plateforme", "White-label", "Facturation"] },
  { name: "Admin Boutique", count: 89, color: "green", permissions: ["Gestion produits", "Commandes", "Clients", "Paiements", "Livraisons", "Marketing"] },
  { name: "Gestionnaire", count: 234, color: "blue", permissions: ["Voir produits", "Modifier stock", "Commandes", "Clients", "Support"] },
  { name: "Vendeur", count: 567, color: "purple", permissions: ["Voir produits", "Commandes", "Clients (lecture)"] },
  { name: "Support", count: 45, color: "yellow", permissions: ["Voir commandes", "Messages clients", "Support tickets"] },
];

// ---------- NOTIFICATIONS ----------
export const NOTIFICATIONS = [
  { id: 1, title: "Nouvelle commande CMD-2842", desc: "Mariam Sow · 52 000 FCFA", time: "Il y a 12 min", unread: true, type: "order" },
  { id: 2, title: "Paiement reçu", desc: "Orange Money · 45 000 FCFA", time: "Il y a 25 min", unread: true, type: "payment" },
  { id: 3, title: "Stock faible", desc: "Café Arabica Man - 5 unités", time: "Il y a 1h", unread: true, type: "warning" },
  { id: 4, title: "Nouveau client VIP", desc: "Aminata Touré a atteint le statut VIP", time: "Il y a 2h", unread: false, type: "customer" },
  { id: 5, title: "Campagne terminée", desc: "Braderie Beauté · 567 000 FCFA générés", time: "Il y a 5h", unread: false, type: "marketing" },
];

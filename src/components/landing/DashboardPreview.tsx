"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  ArrowUpRight,
  MoreHorizontal,
  Search,
  Bell,
  Settings,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Counter } from "./Counter";

const easeOut = [0.16, 1, 0.3, 1] as const;

const salesData = [
  { name: "Lun", value: 42 },
  { name: "Mar", value: 58 },
  { name: "Mer", value: 48 },
  { name: "Jeu", value: 72 },
  { name: "Ven", value: 95 },
  { name: "Sam", value: 110 },
  { name: "Dim", value: 84 },
];

const ordersData = [
  { name: "Sem 1", value: 240 },
  { name: "Sem 2", value: 320 },
  { name: "Sem 3", value: 280 },
  { name: "Sem 4", value: 410 },
];

const channelData = [
  { name: "WhatsApp", value: 45, color: "#25D366" },
  { name: "Boutique", value: 30, color: "#0F8A4B" },
  { name: "Instagram", value: 18, color: "#F7931A" },
  { name: "Autres", value: 7, color: "#94A3B8" },
];

const recentOrders = [
  {
    customer: "Mariama D.",
    product: "Sac en cuir Premium",
    amount: "25 000 FCFA",
    status: "Payé",
    channel: "WhatsApp",
    initials: "MD",
    color: "bg-yaa-green-soft text-yaa-green",
  },
  {
    customer: "Ibrahim K.",
    product: "Caftan brodé main",
    amount: "45 000 FCFA",
    status: "Expédié",
    channel: "Boutique",
    initials: "IK",
    color: "bg-yaa-orange-soft text-yaa-orange",
  },
  {
    customer: "Aïssatou B.",
    product: "Panier tressé",
    amount: "12 500 FCFA",
    status: "Payé",
    channel: "Instagram",
    initials: "AB",
    color: "bg-purple-100 text-purple-600",
  },
  {
    customer: "Ousmane T.",
    product: "Montre en bois",
    amount: "32 000 FCFA",
    status: "En attente",
    channel: "Boutique",
    initials: "OT",
    color: "bg-sky-100 text-sky-600",
  },
];

export function DashboardPreview() {
  return (
    <section
      id="dashboard"
      className="relative py-24 lg:py-32 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-dots opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-yaa-green/8 blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] rounded-full bg-yaa-orange/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yaa-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yaa-green" />
            </span>
            Tableau de bord en temps réel
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: easeOut, delay: 0.05 }}
            className="mt-4 font-display font-extrabold tracking-tight text-slate-900 text-3xl sm:text-4xl lg:text-5xl text-balance"
          >
            Pilotez votre business
            <br className="hidden sm:block" />{" "}
            <span className="text-gradient-green">comme une licorne</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: easeOut, delay: 0.15 }}
            className="mt-5 text-lg text-slate-600 text-pretty"
          >
            Un dashboard digne des meilleures plateformes SaaS mondiales.
            Visualisez vos ventes, commandes, clients et revenus en temps réel.
            Décidez avec des données, pas avec des intuitions.
          </motion.p>
        </div>

        {/* Laptop mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: easeOut }}
          className="relative mx-auto"
        >
          <LaptopFrame>
            <DashboardContent />
          </LaptopFrame>

          {/* Floating cards around laptop */}
          <motion.div
            initial={{ opacity: 0, x: -20, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: easeOut, delay: 0.4 }}
            className="hidden lg:block absolute -left-8 top-1/3 z-20"
          >
            <div className="animate-float-slow">
              <div className="glass-card rounded-2xl p-4 w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    Commandes aujourd'hui
                  </span>
                </div>
                <p className="font-display font-extrabold text-2xl text-slate-900">
                  <Counter value={84} />
                </p>
                <p className="text-[10px] text-yaa-green font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +18% vs hier
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: easeOut, delay: 0.5 }}
            className="hidden lg:block absolute -right-8 top-1/4 z-20"
          >
            <div className="animate-float-medium">
              <div className="glass-card rounded-2xl p-4 w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-yaa-orange flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    Revenus du mois
                  </span>
                </div>
                <p className="font-display font-extrabold text-2xl text-slate-900">
                  <Counter value={250000} />{" "}
                  <span className="text-xs text-slate-500">FCFA</span>
                </p>
                <p className="text-[10px] text-yaa-green font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +32% vs mois dernier
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   Laptop frame with bezel — pure CSS
   ============================================================ */
function LaptopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Screen */}
      <div className="relative rounded-2xl bg-slate-900 p-2 sm:p-3 shadow-premium ring-1 ring-slate-300/40">
        {/* Camera */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-700" />
        <div className="relative rounded-xl overflow-hidden bg-white aspect-[16/10]">
          {children}
        </div>
      </div>
      {/* Base */}
      <div className="relative mx-auto h-3 sm:h-4 w-[104%] -ml-[2%] rounded-b-xl bg-gradient-to-b from-slate-300 to-slate-400 shadow-soft" />
      <div className="relative mx-auto h-1 w-24 rounded-b-md bg-slate-500/40 -mt-0.5" />
    </div>
  );
}

/* ============================================================
   Dashboard content — inside the laptop screen
   ============================================================ */
function DashboardContent() {
  return (
    <div className="flex h-full text-xs">
      {/* Sidebar */}
      <aside className="hidden sm:flex flex-col w-[140px] lg:w-[180px] border-r border-slate-100 bg-slate-50/60 p-3 lg:p-4">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-yaa-green flex items-center justify-center text-white font-bold text-xs">
            Y
          </div>
          <span className="font-display font-bold text-slate-900">YAA</span>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem icon={TrendingUp} label="Vue d'ensemble" active />
          <SidebarItem icon={ShoppingBag} label="Commandes" badge="84" />
          <SidebarItem icon={Package} label="Produits" />
          <SidebarItem icon={Users} label="Clients" />
          <SidebarItem icon={DollarSign} label="Paiements" />
          <SidebarItem icon={Bell} label="Marketing" />
          <SidebarItem icon={Settings} label="Paramètres" />
        </nav>

        <div className="mt-3 p-2 rounded-lg bg-gradient-to-br from-yaa-green to-yaa-green-dark text-white">
          <p className="text-[10px] font-bold">Plan Business</p>
          <p className="text-[9px] opacity-80 mt-0.5">14 jours restants</p>
          <div className="mt-1.5 h-1 rounded-full bg-white/30 overflow-hidden">
            <div className="h-full w-[70%] bg-white" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-slate-100">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm lg:text-base">
              Bonjour, Amina 👋
            </h3>
            <p className="text-[10px] lg:text-xs text-slate-500">
              Voici votre activité aujourd'hui
            </p>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-500 text-[10px]">
              <Search className="w-3 h-3" />
              <span>Rechercher...</span>
            </div>
            <button className="relative w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-600">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yaa-orange" />
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yaa-orange to-yaa-orange-dark text-white flex items-center justify-center font-bold text-[10px]">
              AT
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-hidden p-3 lg:p-4 space-y-3 lg:space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-3">
            <KpiCard
              icon={DollarSign}
              label="Revenus"
              value="250K FCFA"
              change="+32%"
              isPositive
              color="green"
            />
            <KpiCard
              icon={ShoppingBag}
              label="Commandes"
              value="1 248"
              change="+18%"
              isPositive
              color="orange"
            />
            <KpiCard
              icon={Users}
              label="Clients"
              value="892"
              change="+12%"
              isPositive
              color="purple"
            />
            <KpiCard
              icon={Package}
              label="Panier moyen"
              value="18 500"
              change="-3%"
              isPositive={false}
              color="sky"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Sales area chart */}
            <div className="lg:col-span-2 rounded-lg border border-slate-100 bg-white p-3 lg:p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs lg:text-sm">
                    Évolution des ventes
                  </h4>
                  <p className="text-[9px] lg:text-[10px] text-slate-500">
                    7 derniers jours
                  </p>
                </div>
                <button className="text-slate-400 hover:text-slate-700">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="h-[120px] lg:h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sales-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0F8A4B" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#0F8A4B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: 8,
                        fontSize: 10,
                        padding: "4px 8px",
                      }}
                      labelStyle={{ fontSize: 10 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#0F8A4B"
                      strokeWidth={2}
                      fill="url(#sales-grad)"
                      dot={{ r: 2.5, fill: "#0F8A4B" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Channel pie chart */}
            <div className="rounded-lg border border-slate-100 bg-white p-3 lg:p-4">
              <div className="mb-2">
                <h4 className="font-semibold text-slate-900 text-xs lg:text-sm">
                  Canaux de vente
                </h4>
                <p className="text-[9px] lg:text-[10px] text-slate-500">
                  Répartition
                </p>
              </div>
              <div className="h-[100px] lg:h-[120px] flex items-center">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      innerRadius={22}
                      outerRadius={38}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {channelData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1">
                  {channelData.map((c) => (
                    <div key={c.name} className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-sm"
                        style={{ background: c.color }}
                      />
                      <span className="text-[9px] lg:text-[10px] text-slate-700 flex-1">
                        {c.name}
                      </span>
                      <span className="text-[9px] lg:text-[10px] font-bold text-slate-900">
                        {c.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: weekly orders bar chart + recent orders table */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2 rounded-lg border border-slate-100 bg-white p-3 lg:p-4">
              <div className="mb-2">
                <h4 className="font-semibold text-slate-900 text-xs lg:text-sm">
                  Commandes hebdomadaires
                </h4>
                <p className="text-[9px] lg:text-[10px] text-slate-500">
                  4 dernières semaines
                </p>
              </div>
              <div className="h-[120px] lg:h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: 8,
                        fontSize: 10,
                        padding: "4px 8px",
                      }}
                      cursor={{ fill: "#F1F5F9" }}
                    />
                    <Bar dataKey="value" fill="#F7931A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-3 rounded-lg border border-slate-100 bg-white p-3 lg:p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-slate-900 text-xs lg:text-sm">
                  Commandes récentes
                </h4>
                <button className="text-[9px] lg:text-[10px] font-semibold text-yaa-green hover:underline">
                  Voir tout
                </button>
              </div>
              <div className="space-y-1.5 lg:space-y-2">
                {recentOrders.map((order, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 lg:gap-2.5 py-1 lg:py-1.5 hover:bg-slate-50 rounded-md px-1.5"
                  >
                    <div
                      className={`w-6 h-6 lg:w-7 lg:h-7 rounded-full ${order.color} flex items-center justify-center font-bold text-[9px] lg:text-[10px] flex-shrink-0`}
                    >
                      {order.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] lg:text-xs font-semibold text-slate-900 truncate">
                        {order.customer}
                      </p>
                      <p className="text-[9px] lg:text-[10px] text-slate-500 truncate">
                        {order.product}
                      </p>
                    </div>
                    <div className="hidden lg:block text-[9px] text-slate-500 w-16">
                      {order.channel}
                    </div>
                    <div className="text-[10px] lg:text-xs font-bold text-slate-900 whitespace-nowrap">
                      {order.amount}
                    </div>
                    <span
                      className={`text-[9px] lg:text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        order.status === "Payé"
                          ? "bg-yaa-green-soft text-yaa-green"
                          : order.status === "Expédié"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <a
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] lg:text-xs font-medium transition-colors ${
        active
          ? "bg-yaa-green text-white"
          : "text-slate-600 hover:bg-slate-200/60"
      }`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="text-[9px] bg-yaa-orange text-white px-1 py-0 rounded-full font-bold">
          {badge}
        </span>
      )}
    </a>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  change,
  isPositive,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  color: "green" | "orange" | "purple" | "sky";
}) {
  const colors = {
    green: "bg-yaa-green-soft text-yaa-green",
    orange: "bg-yaa-orange-soft text-yaa-orange",
    purple: "bg-purple-100 text-purple-600",
    sky: "bg-sky-100 text-sky-600",
  };
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-2.5 lg:p-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span
          className={`text-[9px] lg:text-[10px] font-bold flex items-center gap-0.5 ${
            isPositive ? "text-yaa-green" : "text-rose-500"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-2.5 h-2.5" />
          ) : (
            <TrendingDown className="w-2.5 h-2.5" />
          )}
          {change}
        </span>
      </div>
      <p className="text-[9px] lg:text-[10px] text-slate-500 mb-0.5">{label}</p>
      <p className="font-display font-bold text-sm lg:text-base text-slate-900">
        {value}
      </p>
    </div>
  );
}

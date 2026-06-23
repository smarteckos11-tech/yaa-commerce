"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Download, ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { PageHeader } from "@/components/admin/ui-bits";
import { DynamicIcon } from "@/components/admin/dynamic-icon";
import { ANALYTICS_PREDICTIONS, REVENUE_CHART_DATA, CONVERSION_FUNNEL, TRAFFIC_SOURCES, TOP_CITIES, formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AnalyticsPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Analytics"
        subtitle="Performances, prédictions IA et insights"
        actions={
          <>
            <Select defaultValue="juin-2026">
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="juin-2026">Juin 2026</SelectItem>
                <SelectItem value="mai-2026">Mai 2026</SelectItem>
                <SelectItem value="avril-2026">Avril 2026</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Exporter</Button>
          </>
        }
      />

      {/* AI Predictions */}
      <motion.div variants={item} className="mb-6">
        <Card className="p-5 lg:p-6 bg-gradient-to-br from-yaa-orange-50/50 to-yaa-green-50/50 dark:from-yaa-orange-950/20 dark:to-yaa-green-950/20 border-yaa-orange-200/50 dark:border-yaa-orange-900/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yaa-orange-500 to-yaa-green-500 flex items-center justify-center">
              <DynamicIcon name="Sparkles" className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-display font-semibold">Prédictions IA — Juillet 2026</h2>
              <p className="text-xs text-muted-foreground">Basé sur 12 mois de données historiques</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {ANALYTICS_PREDICTIONS.map((p) => (
              <div key={p.label} className="p-3 bg-background/60 backdrop-blur rounded-lg border">
                <p className="text-[10px] text-muted-foreground mb-1">{p.label}</p>
                <p className="text-sm font-bold mb-1.5">{p.value}</p>
                <div className="flex items-center justify-between">
                  <span className={cn("inline-flex items-center gap-0.5 text-[10px] font-bold", p.trend === "up" ? "text-yaa-green-600" : "text-rose-600")}>
                    {p.trend === "up" ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                    {p.change}
                  </span>
                  <span className="text-[9px] font-semibold text-yaa-orange-600 bg-yaa-orange-100 dark:bg-yaa-orange-950/50 dark:text-yaa-orange-400 px-1 py-0.5 rounded">
                    {p.confidence}% conf.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Revenue chart */}
      <motion.div variants={item} className="mb-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold">Évolution des revenus</h2>
              <p className="text-xs text-muted-foreground">Réel vs Prédit IA (12 mois)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yaa-green-500" /> Réel</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-yaa-orange-500" style={{ borderTop: "2px dashed" }} /> Prédit</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_CHART_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F8A5F" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0F8A5F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="predicted-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => formatFCFA(v)}
                />
                <Area type="monotone" dataKey="reel" stroke="#0F8A5F" strokeWidth={2.5} fill="url(#revenue-grad)" name="Réel" />
                <Area type="monotone" dataKey="prevu" stroke="#F97316" strokeWidth={2.5} strokeDasharray="8 4" fill="url(#predicted-grad)" name="Prédit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Funnel */}
        <motion.div variants={item}>
          <Card className="p-5">
            <div className="mb-4">
              <h2 className="font-display font-semibold">Entonnoir de conversion</h2>
              <p className="text-xs text-muted-foreground">Tunnel d'achat — 30 derniers jours</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CONVERSION_FUNNEL} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.4} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                    {CONVERSION_FUNNEL.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Traffic sources */}
        <motion.div variants={item}>
          <Card className="p-5">
            <div className="mb-4">
              <h2 className="font-display font-semibold">Sources de trafic</h2>
              <p className="text-xs text-muted-foreground">D'où viennent vos visiteurs</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={TRAFFIC_SOURCES} dataKey="value" innerRadius={42} outerRadius={70} paddingAngle={2}>
                      {TRAFFIC_SOURCES.map((s, i) => (
                        <Cell key={i} fill={s.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {TRAFFIC_SOURCES.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                    <span className="flex-1 text-muted-foreground">{s.name}</span>
                    <span className="font-bold">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Top cities */}
      <motion.div variants={item}>
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="font-display font-semibold">Top villes par revenu</h2>
            <p className="text-xs text-muted-foreground">Vos meilleurs marchés géographiques</p>
          </div>
          <div className="space-y-3">
            {TOP_CITIES.map((c, idx) => (
              <motion.div
                key={c.city}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="flex items-center gap-3"
              >
                <span className="w-20 text-sm font-semibold">{c.city}</span>
                <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.percent}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.06 + 0.2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-yaa-green-500 to-yaa-green-400 rounded-md flex items-center justify-end pr-2"
                  >
                    <span className="text-[10px] font-bold text-white">{c.percent}%</span>
                  </motion.div>
                </div>
                <span className="w-28 text-right text-sm font-bold">{formatFCFA(c.revenue)}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

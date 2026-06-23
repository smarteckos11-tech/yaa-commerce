"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Plus, Search, MoreHorizontal, Eye, Pencil, Mail, Crown, MoreHorizontal as Dots } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatCard, PageHeader, getLoyaltyColor } from "@/components/admin/ui-bits";
import { CUSTOMERS, CUSTOMER_STATS, CUSTOMER_SEGMENTS, CUSTOMER_COUNTRIES, SEGMENT_COLORS, formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ClientsPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Clients"
        subtitle="Votre base de clients et leur fidélité"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><MessageCircle className="h-4 w-4" /> Campagne WhatsApp</Button>
            <Button size="sm" className="gap-1.5 bg-yaa-green-500 hover:bg-yaa-green-600"><Plus className="h-4 w-4" /> Ajouter client</Button>
          </>
        }
      />

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {CUSTOMER_STATS.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            color={s.color}
            icon={s.icon}
            format={s.format as "number" | "fcfa" | "percent" | undefined}
            suffix={s.suffix}
          />
        ))}
      </motion.div>

      <motion.div variants={item}>
        <Card className="p-4 lg:p-5">
          <div className="flex flex-col lg:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un client..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Segment" /></SelectTrigger>
              <SelectContent>
                {CUSTOMER_SEGMENTS.map((s) => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Pays" /></SelectTrigger>
              <SelectContent>
                {CUSTOMER_COUNTRIES.map((c) => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">Plus de filtres</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Client</th>
                  <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Ville / Pays</th>
                  <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell">Contact</th>
                  <th className="text-right font-medium text-muted-foreground px-3 py-2.5">Dépenses</th>
                  <th className="text-center font-medium text-muted-foreground px-3 py-2.5 hidden sm:table-cell">Commandes</th>
                  <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell min-w-[120px]">Fidélité</th>
                  <th className="text-center font-medium text-muted-foreground px-3 py-2.5">Segment</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {CUSTOMERS.map((c, idx) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="border-b last:border-b-0 hover:bg-muted/30"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-xs font-bold">{c.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">Dernière: {c.lastOrder}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell text-muted-foreground">{c.city}, {c.country}</td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                      <p className="text-[10px] text-muted-foreground">{c.whatsapp}</p>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold">{formatFCFA(c.totalSpent)}</td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell text-muted-foreground">{c.orders}</td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden min-w-[60px]">
                          <div className={cn("h-full rounded-full", getLoyaltyColor(c.loyalty))} style={{ width: `${c.loyalty}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground w-6">{c.loyalty}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded", SEGMENT_COLORS[c.segment].bg, SEGMENT_COLORS[c.segment].text)}>
                        {c.segment === "VIP" && <Crown className="h-3 w-3" />}
                        {c.segment}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> Voir profil</DropdownMenuItem>
                          <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" /> Modifier</DropdownMenuItem>
                          <DropdownMenuItem><Mail className="h-4 w-4 mr-2" /> Envoyer email</DropdownMenuItem>
                          <DropdownMenuItem><MessageCircle className="h-4 w-4 mr-2" /> WhatsApp</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

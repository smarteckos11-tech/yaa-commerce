"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Calculator, Plus, MapPin, ArrowRight, Star, Clock, Truck, CheckCircle2, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard, PageHeader } from "@/components/admin/ui-bits";
import { DELIVERY_STATS, SHIPMENTS, CARRIERS, CARRIER_BADGES, DELIVERY_CITIES_LIST, formatFCFA } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const SHIPMENT_STATUS = {
  "En transit": "bg-yaa-orange-100 text-yaa-orange-700 dark:bg-yaa-orange-950/50 dark:text-yaa-orange-400",
  "Livré": "bg-yaa-green-100 text-yaa-green-700 dark:bg-yaa-green-950/50 dark:text-yaa-green-400",
  "En préparation": "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  "Retourné": "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
};

export default function LivraisonsPage() {
  const [calculated, setCalculated] = React.useState(false);
  const [origin, setOrigin] = React.useState("Abidjan");
  const [destination, setDestination] = React.useState("Dakar");
  const [weight, setWeight] = React.useState("1-2");

  const results = [
    { carrier: "Yango", price: 2500, delay: "24-48h", best: true, color: "#E11D48" },
    { carrier: "DHL Express", price: 8500, delay: "48-72h", best: false, color: "#D40511" },
    { carrier: "FedEx International", price: 12000, delay: "72-96h", best: false, color: "#7D2C8C" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Livraisons"
        subtitle="Gérez vos expéditions et calculez vos frais de livraison"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5 border-yaa-orange-300 text-yaa-orange-600 hover:bg-yaa-orange-50"><Calculator className="h-4 w-4" /> Calculer frais</Button>
            <Button size="sm" className="gap-1.5 bg-yaa-orange-500 hover:bg-yaa-orange-600"><Plus className="h-4 w-4" /> Nouvelle expédition</Button>
          </>
        }
      />

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {DELIVERY_STATS.map((s) => (
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
        <Tabs defaultValue="expeditions">
          <TabsList className="mb-4">
            <TabsTrigger value="expeditions">Expéditions</TabsTrigger>
            <TabsTrigger value="transporteurs">Transporteurs</TabsTrigger>
            <TabsTrigger value="calculateur">Calculateur</TabsTrigger>
          </TabsList>

          {/* Expéditions */}
          <TabsContent value="expeditions" className="mt-0">
            <Card className="p-4 lg:p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5">ID</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Client</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden md:table-cell">Trajet</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Transporteur</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5 hidden lg:table-cell">Suivi</th>
                      <th className="text-center font-medium text-muted-foreground px-3 py-2.5">Statut</th>
                      <th className="text-right font-medium text-muted-foreground px-3 py-2.5 hidden sm:table-cell">ETA</th>
                      <th className="text-right font-medium text-muted-foreground px-3 py-2.5">Frais</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SHIPMENTS.map((s, idx) => (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="border-b last:border-b-0 hover:bg-muted/30"
                      >
                        <td className="px-3 py-3 font-mono text-xs">{s.id}</td>
                        <td className="px-3 py-3 font-medium">{s.customer}</td>
                        <td className="px-3 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3 text-muted-foreground" /> {s.from}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3 text-yaa-orange-500" /> {s.to}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={cn("inline-block text-xs font-semibold px-2 py-0.5 rounded", CARRIER_BADGES[s.carrier].bg, CARRIER_BADGES[s.carrier].text)}>
                            {s.carrier}
                          </span>
                        </td>
                        <td className="px-3 py-3 hidden lg:table-cell font-mono text-xs text-muted-foreground">{s.tracking}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={cn("inline-block text-xs font-semibold px-2 py-0.5 rounded", SHIPMENT_STATUS[s.status])}>{s.status}</span>
                        </td>
                        <td className="px-3 py-3 text-right text-xs text-muted-foreground hidden sm:table-cell">{s.eta}</td>
                        <td className="px-3 py-3 text-right font-semibold text-yaa-green-600">{formatFCFA(s.fee)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Transporteurs */}
          <TabsContent value="transporteurs" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              {CARRIERS.map((c, idx) => (
                <motion.div key={c.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Card className="p-4 lg:p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: c.color }}>
                        {c.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.coverage}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Livraisons</p>
                        <p className="font-bold">{c.deliveries}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Note</p>
                        <p className="font-bold flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {c.rating}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Délai</p>
                        <p className="font-bold text-xs">{c.delay}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Tarifs</p>
                        <p className="font-bold text-xs">{c.price}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Calculateur */}
          <TabsContent value="calculateur" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-5 lg:p-6">
                <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-yaa-orange-500" /> Calculer les frais de livraison
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block">Ville d'origine</label>
                    <Select value={origin} onValueChange={setOrigin}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DELIVERY_CITIES_LIST.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block">Ville de destination</label>
                    <Select value={destination} onValueChange={setDestination}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DELIVERY_CITIES_LIST.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block">Poids du colis</label>
                    <Select value={weight} onValueChange={setWeight}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0 - 1 kg</SelectItem>
                        <SelectItem value="1-2">1 - 2 kg</SelectItem>
                        <SelectItem value="2-5">2 - 5 kg</SelectItem>
                        <SelectItem value="5-10">5 - 10 kg</SelectItem>
                        <SelectItem value="10+">10+ kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full bg-yaa-orange-500 hover:bg-yaa-orange-600 gap-1.5"
                    onClick={() => setCalculated(true)}
                  >
                    <Zap className="h-4 w-4" /> Calculer les frais
                  </Button>
                </div>
              </Card>

              {/* Results */}
              <div>
                {calculated ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {origin} → {destination} · {weight} kg
                    </p>
                    {results.map((r, idx) => (
                      <motion.div key={r.carrier} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={cn("p-4 relative overflow-hidden", r.best && "border-yaa-green-500 border-2")}>
                          {r.best && (
                            <span className="absolute top-2 right-2 text-[10px] font-bold text-yaa-green-700 bg-yaa-green-100 dark:bg-yaa-green-950/50 dark:text-yaa-green-400 px-2 py-0.5 rounded">
                              Moins cher
                            </span>
                          )}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: r.color }}>
                              {r.carrier[0]}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{r.carrier}</p>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {r.delay}</p>
                            </div>
                          </div>
                          <p className="text-2xl font-display font-bold text-yaa-green-600">{formatFCFA(r.price)}</p>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center h-full flex flex-col items-center justify-center border-dashed">
                    <Truck className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">Configurez les paramètres et cliquez sur "Calculer les frais" pour voir les options de livraison disponibles.</p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

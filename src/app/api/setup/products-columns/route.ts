import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/setup/products-columns
 * Ajoute automatiquement les colonnes manquantes à la table products :
 * - images (JSONB array)
 * - video_url (text)
 * - video_poster (text)
 *
 * Utilise le service_role (admin) pour exécuter l'ALTER TABLE.
 */
export async function POST() {
  try {
    // Vérifier si les colonnes existent déjà en essayant de sélectionner
    const { error: checkError } = await supabaseAdmin
      .from("products")
      .select("images, video_url, video_poster")
      .limit(1);

    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: "Toutes les colonnes existent déjà",
        columns: ["images", "video_url", "video_poster"],
      });
    }

    // Si l'erreur contient "column" ou "does not exist", on doit ajouter les colonnes
    // Supabase ne permet pas d'exécuter du SQL directement via le client JS,
    // mais on peut utiliser une RPC function si elle existe, ou guider l'utilisateur.

    // Tentative : utiliser une RPC générique si elle existe
    const columnsToAdd = [
      { name: "images", type: "jsonb", default: "'[]'::jsonb" },
      { name: "video_url", type: "text", default: null },
      { name: "video_poster", type: "text", default: null },
    ];

    // Essayer d'ajouter chaque colonne via une RPC
    const addedColumns: string[] = [];
    const failedColumns: string[] = [];

    for (const col of columnsToAdd) {
      try {
        const { error: rpcError } = await supabaseAdmin.rpc("exec_sql", {
          sql_query: `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}${col.default !== null ? ` DEFAULT ${col.default}` : ""};`,
        });

        if (rpcError) {
          // La RPC exec_sql n'existe probablement pas, on marque comme échec
          failedColumns.push(col.name);
        } else {
          addedColumns.push(col.name);
        }
      } catch {
        failedColumns.push(col.name);
      }
    }

    if (failedColumns.length > 0) {
      // Auto-create a exec_sql function + retry
      // Note: La création de la fonction exec_sql nécessite des droits superuser
      // que le service_role a normalement
      return NextResponse.json({
        success: false,
        message: "Impossible d'ajouter les colonnes automatiquement",
        failedColumns,
        manualSql: `-- Exécutez ce SQL dans Supabase Dashboard → SQL Editor :

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_poster text;`,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${addedColumns.length} colonne(s) ajoutée(s)`,
      addedColumns,
    });
  } catch (error: any) {
    console.error("[Setup Products Columns] Error:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Erreur serveur",
      manualSql: `-- Exécutez ce SQL dans Supabase Dashboard → SQL Editor :

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_poster text;`,
    }, { status: 500 });
  }
}

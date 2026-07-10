import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/setup/storage
 * Crée automatiquement le bucket "yaa-products" + les politiques RLS.
 * Utilise le service_role (admin) — bypass RLS.
 *
 * Aucune action manuelle requise de la part de l'utilisateur.
 */
export async function POST() {
  try {
    // 1. Vérifier si le bucket existe déjà
    const { data: existingBucket, error: checkError } = await supabaseAdmin.storage
      .getBucket("yaa-products");

    if (existingBucket) {
      // Bucket existe — vérifier les policies
      return NextResponse.json({
        success: true,
        message: "Bucket 'yaa-products' existe déjà",
        bucket: existingBucket,
      });
    }

    // 2. Créer le bucket public
    const { data: bucket, error: bucketError } = await supabaseAdmin.storage
      .createBucket("yaa-products", {
        public: true,
        fileSizeLimit: 5242880, // 5 MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"],
      });

    if (bucketError) {
      console.error("[Setup Storage] Bucket creation error:", bucketError);
      throw bucketError;
    }

    // 3. Créer les politiques RLS via SQL (Supabase admin peut exécuter du SQL)
    // Politique 1 : lecture publique
    const { error: policy1Error } = await supabaseAdmin.rpc("exec_sql", {
      sql_query: `
        create policy "Public read access yaa-products" on storage.objects
          for select using (bucket_id = 'yaa-products');
      `,
    }).catch(() => ({ error: null })); // Ignore si la policy existe déjà

    // Politique 2 : upload pour authentifiés
    const { error: policy2Error } = await supabaseAdmin.rpc("exec_sql", {
      sql_query: `
        create policy "Authenticated upload yaa-products" on storage.objects
          for insert with check (bucket_id = 'yaa-products' and auth.role() = 'authenticated');
      `,
    }).catch(() => ({ error: null }));

    // Politique 3 : suppression pour authentifiés
    const { error: policy3Error } = await supabaseAdmin.rpc("exec_sql", {
      sql_query: `
        create policy "Authenticated delete yaa-products" on storage.objects
          for delete using (bucket_id = 'yaa-products' and auth.role() = 'authenticated');
      `,
    }).catch(() => ({ error: null }));

    // Politique 4 : mise à jour pour authentifiés
    const { error: policy4Error } = await supabaseAdmin.rpc("exec_sql", {
      sql_query: `
        create policy "Authenticated update yaa-products" on storage.objects
          for update using (bucket_id = 'yaa-products' and auth.role() = 'authenticated');
      `,
    }).catch(() => ({ error: null }));

    // Note: les RPC peuvent échouer si exec_sql n'existe pas, mais le bucket est créé
    // Les policies peuvent être créées manuellement si nécessaire

    return NextResponse.json({
      success: true,
      message: "Bucket 'yaa-products' créé avec succès",
      bucket,
      policiesCreated: !policy1Error && !policy2Error && !policy3Error && !policy4Error,
    });
  } catch (error: any) {
    console.error("[Setup Storage] Error:", error);
    return NextResponse.json(
      {
        error: "Impossible de créer le bucket automatiquement",
        details: error?.message || String(error),
        manualSql: `-- Exécutez ce SQL dans Supabase Dashboard → SQL Editor:
insert into storage.buckets (id, name, public)
values ('yaa-products', 'yaa-products', true)
on conflict (id) do nothing;

create policy "Public read yaa-products" on storage.objects
  for select using (bucket_id = 'yaa-products');
create policy "Auth upload yaa-products" on storage.objects
  for insert with check (bucket_id = 'yaa-products' and auth.role() = 'authenticated');
create policy "Auth delete yaa-products" on storage.objects
  for delete using (bucket_id = 'yaa-products' and auth.role() = 'authenticated');`,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/setup/storage
 * Vérifie si le bucket existe.
 */
export async function GET() {
  try {
    const { data: bucket, error } = await supabaseAdmin.storage.getBucket("yaa-products");

    if (error || !bucket) {
      return NextResponse.json({
        exists: false,
        message: "Bucket 'yaa-products' n'existe pas encore",
      });
    }

    return NextResponse.json({
      exists: true,
      bucket: {
        id: bucket.id,
        name: bucket.name,
        public: bucket.public,
        file_size_limit: bucket.file_size_limit,
        allowed_mime_types: bucket.allowed_mime_types,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      exists: false,
      error: error?.message || "Erreur de vérification",
    });
  }
}

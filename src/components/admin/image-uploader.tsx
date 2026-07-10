"use client";

import * as React from "react";
import { X, Loader2, ImagePlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

type UploadResult = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
};

/**
 * Composant d'upload d'images.
 *
 * Utilise Supabase Storage par défaut (aucune configuration requise —
 * fonctionne immédiatement avec le projet Supabase déjà connecté).
 *
 * Si Cloudinary est configuré (via /api/cloudinary/config), il sera utilisé
 * à la place pour de meilleures performances et transformations d'images.
 */
export function ImageUploader({
  images,
  onChange,
  multiple = false,
  maxImages = 1,
  label = "Photos",
}: {
  images: UploadResult[];
  onChange: (images: UploadResult[]) => void;
  multiple?: boolean;
  maxImages?: number;
  label?: string;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [storageReady, setStorageReady] = React.useState<boolean | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Check on mount if Supabase Storage bucket is accessible
  React.useEffect(() => {
    checkStorageBucket();
  }, []);

  async function checkStorageBucket() {
    try {
      const { error } = await supabase.storage
        .from("yaa-products")
        .list("", { limit: 1 });
      // If error is "Bucket not found", bucket doesn't exist yet
      if (error && error.message.includes("not found")) {
        setStorageReady(false);
      } else {
        setStorageReady(true);
      }
    } catch {
      setStorageReady(false);
    }
  }

  // Upload to Supabase Storage (default — no config needed)
  const uploadToSupabase = async (file: File): Promise<UploadResult> => {
    // Generate a unique filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const path = `products/${filename}`;

    const { data, error: uploadError } = await supabase.storage
      .from("yaa-products")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("yaa-products")
      .getPublicUrl(path);

    return {
      secure_url: urlData.publicUrl,
      public_id: path,
      width: 0,
      height: 0,
    };
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      const remaining = maxImages - images.length;
      const toUpload = Array.from(files).slice(0, remaining);
      const newImages: UploadResult[] = [];

      for (const file of toUpload) {
        if (!file.type.startsWith("image/")) {
          setError(`${file.name} n'est pas une image`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError(`${file.name} dépasse 5MB`);
          continue;
        }

        try {
          const result = await uploadToSupabase(file);
          newImages.push(result);
        } catch (uploadErr) {
          console.error("[ImageUploader] Upload error:", uploadErr);
          setError(
            uploadErr instanceof Error
              ? `Erreur: ${uploadErr.message}`
              : `Erreur upload ${file.name}`
          );
        }
      }

      if (multiple) {
        onChange([...images, ...newImages]);
      } else {
        onChange(newImages.slice(0, 1));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = async (index: number) => {
    const img = images[index];
    // Try to delete from Supabase Storage (best effort, don't block UI)
    if (img.public_id && !img.public_id.startsWith("http")) {
      try {
        await supabase.storage.from("yaa-products").remove([img.public_id]);
      } catch (err) {
        console.warn("[ImageUploader] Delete error:", err);
      }
    }
    const next = [...images];
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block">{label}</label>

      {/* Status banner */}
      {storageReady === false && (
        <div className="mb-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 flex items-start gap-2 text-amber-700 dark:text-amber-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="text-[11px]">
            <p className="font-semibold mb-1">Bucket de stockage requis</p>
            <p>
              Exécutez ce SQL dans Supabase Dashboard → SQL Editor pour créer le bucket :
            </p>
            <pre className="mt-1 p-2 bg-amber-100 dark:bg-amber-900/50 rounded text-[10px] overflow-x-auto whitespace-pre-wrap break-all">
{`insert into storage.buckets (id, name, public)
values ('yaa-products', 'yaa-products', true)
on conflict (id) do nothing;`}
            </pre>
            <button
              type="button"
              onClick={checkStorageBucket}
              className="mt-1 text-amber-700 underline text-[10px] font-semibold"
            >
              Re-vérifier
            </button>
          </div>
        </div>
      )}

      {storageReady === true && (
        <div className="mb-2 p-2 rounded-lg bg-yaa-green-50 dark:bg-yaa-green-950/30 border border-yaa-green-200 flex items-center gap-2 text-[10px] text-yaa-green-700 dark:text-yaa-green-400">
          <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
          Stockage Supabase prêt · Aucune configuration requise
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {images.map((img, i) => (
          <div
            key={img.public_id || i}
            className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.secure_url}
              alt={`Image ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              aria-label="Supprimer"
            >
              <X className="w-3 h-3" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-yaa-green-500 text-white">
                Principale
              </span>
            )}
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-yaa-green-500 hover:bg-yaa-green-50/50 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground",
              uploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-5 h-5" />
                <span className="text-[10px] font-medium">Ajouter</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p className="mt-2 text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}

      <p className="mt-1.5 text-[10px] text-muted-foreground">
        {multiple
          ? `${images.length}/${maxImages} images · JPG, PNG, WebP · max 5MB chacune`
          : "JPG, PNG, WebP · max 5MB"}
      </p>
    </div>
  );
}

"use client";

import * as React from "react";
import { X, Loader2, ImagePlus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadResult = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
};

/**
 * Composant d'upload d'images vers Cloudinary.
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
  const inputRef = React.useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const isConfigured = !!cloudName;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!isConfigured) {
      setError("Cloudinary n'est pas configuré. Ajoutez NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME dans .env.local");
      return;
    }

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

        const sigRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: "yaa-products" }),
        });
        const sigData = await sigRes.json();

        if (sigData.error) {
          setError(sigData.error);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", sigData.apiKey);
        formData.append("signature", sigData.signature);
        formData.append("timestamp", sigData.timestamp);
        formData.append("folder", sigData.folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );
        const uploadData = await uploadRes.json();

        if (uploadData.error) {
          setError(uploadData.error.message);
          continue;
        }

        newImages.push({
          secure_url: uploadData.secure_url,
          public_id: uploadData.public_id,
          width: uploadData.width,
          height: uploadData.height,
        });
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

  const removeImage = (index: number) => {
    const next = [...images];
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 block">{label}</label>

      {!isConfigured && (
        <div className="mb-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 flex items-start gap-2 text-amber-700 dark:text-amber-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <p className="text-[11px]">
            Cloudinary non configuré. Créez un compte sur{" "}
            <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
              cloudinary.com
            </a>{" "}
            (gratuit) puis ajoutez <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> dans .env.local
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {images.map((img, i) => (
          <div
            key={img.public_id}
            className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group"
          >
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
            disabled={uploading || !isConfigured}
            className={cn(
              "aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-yaa-green-500 hover:bg-yaa-green-50/50 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground",
              (uploading || !isConfigured) && "opacity-50 cursor-not-allowed"
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

import { NextResponse } from "next/server";

/**
 * GET /api/cloudinary/config
 * Retourne la configuration Cloudinary PUBLIQUE (sans secrets).
 * Utilisé par le client pour savoir si Cloudinary est configuré
 * et quelle méthode d'upload utiliser (signed vs unsigned).
 */
export async function GET() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const signedConfigured = !!(cloudName && apiKey && apiSecret);
  const unsignedConfigured = !!(cloudName && uploadPreset);

  return NextResponse.json({
    cloudName: cloudName || null,
    uploadPreset: uploadPreset || null,
    signedConfigured,
    unsignedConfigured,
    configured: signedConfigured || unsignedConfigured,
    method: signedConfigured ? "signed" : unsignedConfigured ? "unsigned" : null,
  });
}

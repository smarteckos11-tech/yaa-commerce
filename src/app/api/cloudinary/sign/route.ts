import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * POST /api/cloudinary/sign
 * Génère une signature signée pour l'upload Cloudinary côté serveur.
 *
 * Requiert les variables d'environnement:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 *
 * Body: { folder?: string }
 * Returns: { signature, timestamp, apiKey, folder, cloudName }
 */
export async function POST(req: NextRequest) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          error: "Cloudinary non configuré. Ajoutez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans les variables d'environnement.",
          configured: false,
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const folder = body.folder || "yaa-products";

    const timestamp = Math.floor(Date.now() / 1000);

    // Build parameters to sign
    const paramsToSign: Record<string, string> = {
      folder,
      timestamp: String(timestamp),
    };

    // Sort parameters alphabetically and build the string to sign
    const sortedParams = Object.keys(paramsToSign)
      .sort()
      .map((k) => `${k}=${paramsToSign[k]}`)
      .join("&");

    const signature = crypto
      .createHash("sha1")
      .update(sortedParams + apiSecret)
      .digest("hex");

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      folder,
      cloudName,
      configured: true,
    });
  } catch (error: any) {
    console.error("[Cloudinary Sign] Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la signature", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cloudinary/sign
 * Retourne l'état de configuration Cloudinary (sans exposer les secrets).
 */
export async function GET() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  return NextResponse.json({
    configured: !!(cloudName && apiKey && apiSecret),
    unsignedConfigured: !!(cloudName && uploadPreset),
    cloudName: cloudName || null,
    uploadPreset: uploadPreset || null,
  });
}

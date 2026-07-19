"use client";

import * as React from "react";

type Pixels = {
  meta_pixel_id: string | null;
  tiktok_pixel_id: string | null;
  google_ads_id: string | null;
  snapchat_pixel_id: string | null;
  twitter_pixel_id: string | null;
  tracking_enabled: boolean;
};

/**
 * Composant qui injecte les pixels publicitaires (Meta, TikTok, Google Ads)
 * sur la page boutique. Charge les pixels depuis /api/pixels?userId=xxx.
 *
 * Événements trackés automatiquement :
 * - PageView (sur toutes les pages)
 * - ViewContent (sur fiche produit)
 * - AddToCart (quand client ajoute au panier)
 * - InitiateCheckout (quand client va au checkout)
 * - Purchase (quand commande confirmée)
 */
export function PixelTracker({ userId }: { userId: string }) {
  const [pixels, setPixels] = React.useState<Pixels | null>(null);

  React.useEffect(() => {
    if (!userId) return;
    fetch(`/api/pixels?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.pixels) setPixels(data.pixels);
      })
      .catch(() => {});
  }, [userId]);

  // Inject Meta Pixel
  React.useEffect(() => {
    if (!pixels?.meta_pixel_id || !pixels?.tracking_enabled) return;

    // Meta Pixel base code
    const script = document.createElement("script");
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixels.meta_pixel_id}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [pixels?.meta_pixel_id, pixels?.tracking_enabled]);

  // Inject TikTok Pixel
  React.useEffect(() => {
    if (!pixels?.tiktok_pixel_id || !pixels?.tracking_enabled) return;

    const script = document.createElement("script");
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},
        ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
        var o=d.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
        var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${pixels.tiktok_pixel_id}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [pixels?.tiktok_pixel_id, pixels?.tracking_enabled]);

  // Inject Google Ads
  React.useEffect(() => {
    if (!pixels?.google_ads_id || !pixels?.tracking_enabled) return;

    const script1 = document.createElement("script");
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${pixels.google_ads_id}`;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${pixels.google_ads_id}');
    `;
    document.head.appendChild(script2);

    return () => {
      try {
        document.head.removeChild(script1);
        document.head.removeChild(script2);
      } catch {}
    };
  }, [pixels?.google_ads_id, pixels?.tracking_enabled]);

  return null;
}

/**
 * Helpers pour tracker des événements depuis n'importe où dans l'app.
 */
export const trackEvent = {
  viewContent: (data: { content_name: string; content_ids: string; value: number; currency: string }) => {
    if (typeof window === "undefined") return;
    if ((window as any).fbq) (window as any).fbq("track", "ViewContent", data);
    if ((window as any).ttq) (window as any).ttq.track("ViewContent", data);
    if ((window as any).gtag) (window as any).gtag("event", "view_item", data);
  },
  addToCart: (data: { content_name: string; content_ids: string; value: number; currency: string }) => {
    if (typeof window === "undefined") return;
    if ((window as any).fbq) (window as any).fbq("track", "AddToCart", data);
    if ((window as any).ttq) (window as any).ttq.track("AddToCart", data);
    if ((window as any).gtag) (window as any).gtag("event", "add_to_cart", data);
  },
  initiateCheckout: (data: { value: number; currency: string }) => {
    if (typeof window === "undefined") return;
    if ((window as any).fbq) (window as any).fbq("track", "InitiateCheckout", data);
    if ((window as any).ttq) (window as any).ttq.track("InitiateCheckout", data);
    if ((window as any).gtag) (window as any).gtag("event", "begin_checkout", data);
  },
  purchase: (data: { value: number; currency: string; transaction_id: string }) => {
    if (typeof window === "undefined") return;
    if ((window as any).fbq) (window as any).fbq("track", "Purchase", data);
    if ((window as any).ttq) (window as any).ttq.track("CompletePayment", data);
    if ((window as any).gtag) (window as any).gtag("event", "purchase", data);
  },
};

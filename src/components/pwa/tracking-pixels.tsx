/* eslint-disable prefer-rest-params, prefer-spread, @typescript-eslint/no-unused-expressions */
"use client";

import { useEffect } from "react";

/**
 * Facebook Pixel + Google Analytics tracking.
 * Pixels IDs are configured via env vars.
 * Set NEXT_PUBLIC_FACEBOOK_PIXEL_ID and NEXT_PUBLIC_GA_ID in .env.local
 */
export function TrackingPixels() {
  useEffect(() => {
    // Facebook Pixel
    const fbPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
    if (fbPixelId && typeof window !== "undefined") {
      // @ts-ignore
      if (!window.fbq) {
        // @ts-ignore
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        // @ts-ignore
        window.fbq('init', fbPixelId);
        // @ts-ignore
        window.fbq('track', 'PageView');
      }
    }

    // Google Analytics
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (gaId && typeof window !== "undefined") {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);
      // @ts-ignore
      window.dataLayer = window.dataLayer || [];
      // @ts-ignore
      window.gtag = function(){window.dataLayer.push(arguments)};
      // @ts-ignore
      window.gtag('js', new Date());
      // @ts-ignore
      window.gtag('config', gaId);
    }
  }, []);

  return null;
}

/**
 * Track a custom event (purchase, add to cart, etc.)
 * Usage: trackEvent('Purchase', { value: 25000, currency: 'XOF' })
 */
export function trackEvent(event: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  // @ts-ignore
  if (window.fbq) window.fbq('track', event, params);
  // @ts-ignore
  if (window.gtag) window.gtag('event', event, params);
}

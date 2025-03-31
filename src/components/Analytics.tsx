'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { config } from '../utils/analytics-config';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export default function Analytics() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      (window as any).gtag = function(...args: any[]) {
        window.dataLayer.push(args);
      };
      (window as any).gtag('js', new Date());
      (window as any).gtag('config', config.measurementId, {
        debug_mode: config.debug,
        cookie_domain: config.cookieDomain,
        anonymize_ip: config.anonymizeIp,
        custom_map: {
          dimension1: 'client_id',
          dimension2: 'engagement_time_msec',
          dimension3: 'session_id',
          dimension4: 'session_number',
        },
      });
    }
  }, []);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`}
        strategy="afterInteractive"
      />
    </>
  );
} 
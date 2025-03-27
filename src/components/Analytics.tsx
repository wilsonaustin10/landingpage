'use client';

import { useEffect } from 'react';
import { getAnalyticsConfig } from '@/utils/analytics';

export default function Analytics() {
  useEffect(() => {
    // Load Google Analytics script
    const loadGoogleAnalytics = () => {
      const config = getAnalyticsConfig();
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
      script.async = true;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: any[]) {
        window.dataLayer.push(args);
      };

      // Basic configuration
      window.gtag('js', new Date());
      window.gtag('config', config.measurementId, {
        debug_mode: config.debug,
        cookie_domain: config.cookieDomain,
        anonymize_ip: config.anonymizeIp,
        custom_map: {
          dimension1: 'environment',
          metric1: 'loadTime',
          metric2: 'userTiming',
        },
      });

      // Track page load timing
      if (window.performance) {
        window.gtag('event', 'timing_complete', {
          name: 'load',
          value: Math.round(performance.now()),
          event_category: 'Page Load',
        });
      }
    };

    loadGoogleAnalytics();
  }, []);

  return null;
}

// Declare types for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
} 